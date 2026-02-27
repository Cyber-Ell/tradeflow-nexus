# MarketHub Deployment Guide

## Production Deployment

### Prerequisites

- AWS Account (or alternative cloud provider)
- Docker installed
- GitHub repository (recommended)
- Domain name
- SSL certificate

## Option 1: AWS ECS Deployment

### Step 1: Prepare Application

```bash
# Build production images
docker build -t marketplace:latest .

# Tag for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag marketplace:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/marketplace:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/marketplace:latest
```

### Step 2: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name marketplace-prod

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Step 3: Create ECS Service

```bash
aws ecs create-service \
  --cluster marketplace-prod \
  --service-name marketplace-service \
  --task-definition marketplace:1 \
  --desired-count 2 \
  --launch-type EC2 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=frontend,containerPort=3001
```

## Option 2: Kubernetes Deployment

### Create Kubernetes Manifests

**frontend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marketplace-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: marketplace-frontend
  template:
    metadata:
      labels:
        app: marketplace-frontend
    spec:
      containers:
      - name: frontend
        image: marketplace:latest
        ports:
        - containerPort: 3001
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.marketplace.com"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: marketplace-frontend-service
spec:
  selector:
    app: marketplace-frontend
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

**backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marketplace-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: marketplace-backend
  template:
    metadata:
      labels:
        app: marketplace-backend
    spec:
      containers:
      - name: backend
        image: marketplace:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: marketplace-secrets
              key: jwt-secret
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: marketplace-secrets
              key: database-url
        - name: PAYSTACK_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: marketplace-secrets
              key: paystack-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: marketplace-backend-service
spec:
  selector:
    app: marketplace-backend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic marketplace-secrets \
  --from-literal=jwt-secret=$(openssl rand -base64 32) \
  --from-literal=database-url=postgresql://... \
  --from-literal=paystack-secret=sk_live_...

# Deploy
kubectl apply -f frontend-deployment.yaml
kubectl apply -f backend-deployment.yaml

# Check status
kubectl get pods
kubectl get svc
```

## Option 3: Heroku Deployment

### Step 1: Prepare for Heroku

Create **Procfile**:
```
web: yarn workspace backend start
release: yarn workspace backend seed
```

Create **app.json**:
```json
{
  "name": "marketplace",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "JWT_SECRET": {
      "description": "JWT secret key"
    },
    "PAYSTACK_SECRET_KEY": {
      "description": "Paystack secret key"
    }
  }
}
```

### Step 2: Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create marketplace-app

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set PAYSTACK_SECRET_KEY=sk_live_...

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

## Database Migration to PostgreSQL

For production scalability, migrate from SQLite to PostgreSQL:

### Step 1: Update Database Config

**backend/src/config/database-postgres.ts:**
```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function getDatabase() {
  return pool
}
```

### Step 2: Update Package.json

```json
{
  "dependencies": {
    "pg": "^8.11.0"
  }
}
```

### Step 3: Migrate Data

```bash
# Create PostgreSQL database
createdb marketplace

# Run migrations
yarn workspace backend migrate:up
```

## SSL/TLS Configuration

### Using Let's Encrypt with AWS

```bash
# Request certificate
aws acm request-certificate \
  --domain-name api.marketplace.com \
  --validation-method DNS

# Attach to ELB
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:...
```

### Using Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name api.marketplace.com;

    ssl_certificate /etc/letsencrypt/live/api.marketplace.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.marketplace.com/privkey.pem;

    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring & Logging

### CloudWatch Setup

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/marketplace

# Configure container logs
aws ecs update-service \
  --cluster marketplace-prod \
  --service marketplace-service \
  --log-configuration awslogs-group=/ecs/marketplace
```

### Application Monitoring

Install New Relic:

```bash
npm install newrelic

# In src/index.ts (first line)
require('newrelic')
```

Configure **newrelic.js**:
```javascript
exports.config = {
  app_name: ['MarketHub'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  }
}
```

### RabbitMQ Setup (Production)

```bash
# AWS MQ
aws mq create-broker \
  --broker-name marketplace-broker \
  --engine-type RABBITMQ \
  --engine-version 3.12.0 \
  --host-instance-type mq.t3.micro

# Update backend/.env
RABBITMQ_URL=amqps://user:pass@broker-id.mq.region.amazonaws.com:5671
```

## CI/CD Pipeline

### GitHub Actions

Create **.github/workflows/deploy.yml**:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t marketplace:${{ github.sha }} .
      
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker tag marketplace:${{ github.sha }} $ECR_REGISTRY/marketplace:latest
          docker push $ECR_REGISTRY/marketplace:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster marketplace-prod --service marketplace-service --force-new-deployment
```

## Auto-Scaling Configuration

### EC2 Auto Scaling

```bash
# Create launch configuration
aws autoscaling create-launch-configuration \
  --launch-configuration-name marketplace-lc \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --security-groups sg-12345678

# Create auto-scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name marketplace-asg \
  --launch-configuration-name marketplace-lc \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --load-balancer-names marketplace-elb
```

## Backup Strategy

```bash
# Daily automated backups
aws backup create-backup-plan --backup-plan name=marketplace-daily,rules=[{RuleName=Daily,TargetBackupVaultName=marketplace-vault,ScheduleExpression='cron(0 2 * * ? *)'}]

# Database dumps
0 3 * * * pg_dump marketplace > /backups/marketplace-$(date +\%Y\%m\%d).sql
```

## Security Hardening

### WAF Configuration

```bash
aws wafv2 create-web-acl \
  --name marketplace-waf \
  --scope CLOUDFRONT \
  --default-action Block={} \
  --rules '[
    {
      "Name": "RateLimitRule",
      "Priority": 0,
      "Action": {"Block": {}},
      "Statement": {
        "RateBasedStatement": {"Limit": 2000, "AggregateKeyType": "IP"}
      }
    }
  ]'
```

### Security Headers

```bash
# Add to Nginx/Load Balancer
add_header Strict-Transport-Security "max-age=31536000" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

## Performance Optimization

### CDN Configuration

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name marketplace-app.s3.amazonaws.com \
  --default-root-object index.html \
  --cache-behaviors '[
    {
      "PathPattern": "/static/*",
      "ViewerProtocolPolicy": "allow-all",
      "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
    }
  ]'
```

### Database Optimization

```sql
-- Add indexes for production
CREATE INDEX idx_products_vendor ON products(vendorId);
CREATE INDEX idx_orders_wholesale ON orders(wholesalerId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_users_role ON users(role);
```

## Health Checks

```bash
# Monitor endpoint
GET /health

# Response:
{
  "status": "OK",
  "timestamp": "2024-02-27T20:00:00Z"
}
```

## Disaster Recovery

### Backup & Restore

```bash
# Backup database
pg_dump -Fc marketplace > backup.dump

# Restore database
pg_restore -d marketplace_restore backup.dump

# Verify
psql -d marketplace_restore -c "SELECT COUNT(*) FROM users;"
```

## Rollback Procedure

```bash
# ECS rollback
aws ecs update-service \
  --cluster marketplace-prod \
  --service marketplace-service \
  --task-definition marketplace:previous

# Kubernetes rollback
kubectl rollout undo deployment/marketplace-backend
kubectl rollout undo deployment/marketplace-frontend
```

## Performance Benchmarks

Target metrics:
- API response time: < 200ms
- Page load time: < 2s
- Database query: < 100ms
- 99th percentile latency: < 500ms

## Cost Optimization

- Use spot instances for non-critical services
- Configure auto-scaling based on metrics
- Use CloudFront for static assets
- Archive old logs to S3 Glacier
- Use managed databases instead of self-hosted

## Support & Monitoring

- Set up CloudWatch alarms
- Configure SNS notifications
- Use DataDog or New Relic for APM
- Set up PagerDuty for on-call rotation
- Implement distributed tracing with Jaeger

For detailed deployment support, refer to cloud provider documentation.
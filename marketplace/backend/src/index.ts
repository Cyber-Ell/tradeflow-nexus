import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import 'express-async-errors'
import dotenv from 'dotenv'

import { initializeDatabase } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import orderRoutes from './routes/orders'
import adminRoutes from './routes/admin'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/admin', adminRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' })
})

// Error handler
app.use(errorHandler)

// Initialize database and start server
async function start() {
  try {
    await initializeDatabase()
    console.log('Database initialized')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
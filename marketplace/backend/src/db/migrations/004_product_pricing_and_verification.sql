ALTER TABLE products ADD COLUMN moq INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS product_price_tiers (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  minQuantity INTEGER NOT NULL,
  unitPrice REAL NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_price_tiers_productId ON product_price_tiers(productId);

CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  documentType TEXT NOT NULL,
  documentNumber TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  submittedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  reviewedAt TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);

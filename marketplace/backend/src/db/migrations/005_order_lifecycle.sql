PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS orders_new (
  id TEXT PRIMARY KEY,
  wholesalerId TEXT NOT NULL,
  vendorId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK(status IN ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
  total REAL NOT NULL,
  items TEXT NOT NULL,
  paymentRef TEXT,
  trackingNumber TEXT,
  deliveryAddress TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(wholesalerId) REFERENCES users(id),
  FOREIGN KEY(vendorId) REFERENCES users(id)
);

INSERT INTO orders_new (id, wholesalerId, vendorId, status, total, items, paymentRef, trackingNumber, deliveryAddress, createdAt, updatedAt)
SELECT
  id,
  wholesalerId,
  vendorId,
  CASE
    WHEN status = 'pending' THEN 'pending_payment'
    ELSE status
  END,
  total,
  items,
  paymentRef,
  trackingNumber,
  deliveryAddress,
  createdAt,
  updatedAt
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

CREATE INDEX IF NOT EXISTS idx_orders_wholesalerId ON orders(wholesalerId);
CREATE INDEX IF NOT EXISTS idx_orders_vendorId ON orders(vendorId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  unitPrice REAL NOT NULL,
  quantity INTEGER NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(productId) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
CREATE INDEX IF NOT EXISTS idx_order_items_productId ON order_items(productId);

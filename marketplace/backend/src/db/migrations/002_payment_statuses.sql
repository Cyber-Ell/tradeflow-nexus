PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS payments_new (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'authorized', 'escrow_held', 'released', 'failed', 'refunded', 'disputed')),
  paymentMethod TEXT,
  paystackRef TEXT,
  escrowHeldUntil TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO payments_new (id, orderId, amount, status, paymentMethod, paystackRef, escrowHeldUntil, createdAt, updatedAt)
SELECT
  id,
  orderId,
  amount,
  CASE
    WHEN status = 'completed' THEN 'escrow_held'
    ELSE status
  END,
  paymentMethod,
  paystackRef,
  escrowHeldUntil,
  createdAt,
  updatedAt
FROM payments;

DROP TABLE payments;
ALTER TABLE payments_new RENAME TO payments;

CREATE INDEX IF NOT EXISTS idx_payments_orderId ON payments(orderId);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

PRAGMA foreign_keys = ON;

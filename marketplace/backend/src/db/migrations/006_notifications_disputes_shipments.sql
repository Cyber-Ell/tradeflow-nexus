CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  relatedEntityType TEXT,
  relatedEntityId TEXT,
  readAt TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_readAt ON notifications(readAt);

CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  openedByUserId TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'under_review', 'resolved', 'rejected')),
  resolution TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(openedByUserId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_disputes_orderId ON disputes(orderId);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

CREATE TABLE IF NOT EXISTS shipment_events (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  trackingId TEXT,
  status TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(trackingId) REFERENCES logistics_tracking(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_orderId ON shipment_events(orderId);

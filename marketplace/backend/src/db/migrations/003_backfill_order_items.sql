INSERT INTO order_items (id, orderId, productId, productName, unitPrice, quantity, createdAt)
SELECT
  lower(hex(randomblob(16))),
  o.id,
  json_extract(j.value, '$.productId'),
  COALESCE(json_extract(j.value, '$.name'), ''),
  COALESCE(json_extract(j.value, '$.price'), 0),
  COALESCE(json_extract(j.value, '$.quantity'), 0),
  o.createdAt
FROM orders o
JOIN json_each(o.items) j
WHERE o.items IS NOT NULL
  AND json_valid(o.items) = 1
  AND NOT EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.orderId = o.id
  );

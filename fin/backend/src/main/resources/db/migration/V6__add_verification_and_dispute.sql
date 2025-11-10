-- Add verification document and rejection reason to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_document LONGTEXT,
  ADD COLUMN IF NOT EXISTS verification_rejection_reason TEXT;

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  reporter_id BIGINT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'OPEN',
  refund_amount DECIMAL(10,2),
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  CONSTRAINT fk_dispute_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_dispute_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

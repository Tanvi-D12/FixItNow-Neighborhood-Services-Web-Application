-- Add urgency_level column to bookings table
ALTER TABLE bookings ADD COLUMN urgency_level VARCHAR(20) DEFAULT 'NORMAL';

-- Update existing bookings to have NORMAL urgency if not specified
UPDATE bookings SET urgency_level = 'NORMAL' WHERE urgency_level IS NULL;
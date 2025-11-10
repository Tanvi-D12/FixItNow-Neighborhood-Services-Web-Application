-- Add latitude and longitude columns to services table for Google Maps integration
-- This migration adds geographic coordinates support to enable map-based service search

ALTER TABLE services 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add an index for efficient geographic queries
CREATE INDEX idx_services_coordinates ON services(latitude, longitude);

-- Add a composite index for active services with coordinates
CREATE INDEX idx_services_active_coordinates ON services(is_active, latitude, longitude) 
WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;
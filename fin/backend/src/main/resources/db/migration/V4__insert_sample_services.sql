-- Insert sample services for testing map and categories functionality
-- This migration adds sample services with proper categories, coordinates, and provider information

-- First, ensure we have some sample providers (users with PROVIDER role)
INSERT INTO users (id, name, email, password, phone, role, location, bio, is_active, is_verified, created_at) VALUES
(100, 'John Plumber', 'john.plumber@fixitnow.com', '$2a$10$HASHED_PASSWORD_HERE', '+91-9876543210', 'PROVIDER', 'Hyderabad, Telangana', 'Professional plumber with 10+ years experience', true, true, CURRENT_TIMESTAMP),
(101, 'Sarah Electrician', 'sarah.electric@fixitnow.com', '$2a$10$HASHED_PASSWORD_HERE', '+91-9876543211', 'PROVIDER', 'Hyderabad, Telangana', 'Licensed electrician specializing in home repairs', true, true, CURRENT_TIMESTAMP),
(102, 'Mike Carpenter', 'mike.carpenter@fixitnow.com', '$2a$10$HASHED_PASSWORD_HERE', '+91-9876543212', 'PROVIDER', 'Hyderabad, Telangana', 'Expert carpenter for all woodwork needs', true, true, CURRENT_TIMESTAMP),
(103, 'Lisa Cleaner', 'lisa.cleaner@fixitnow.com', '$2a$10$HASHED_PASSWORD_HERE', '+91-9876543213', 'PROVIDER', 'Hyderabad, Telangana', 'Professional home cleaning services', true, true, CURRENT_TIMESTAMP),
(104, 'David AC Tech', 'david.ac@fixitnow.com', '$2a$10$HASHED_PASSWORD_HERE', '+91-9876543214', 'PROVIDER', 'Hyderabad, Telangana', 'AC repair and maintenance specialist', true, true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert sample services with proper coordinates (Hyderabad area)
-- Coordinates are around Hyderabad city (17.3850° N, 78.4867° E)
INSERT INTO services (id, title, description, category, subcategory, price, provider_id, location, latitude, longitude, is_active, availability, created_at) VALUES
-- Plumbing Services
(200, 'Emergency Plumbing Repair', 'Quick response plumbing repairs for homes and offices. Available 24/7 for urgent issues.', 'Plumbing', 'Pipe Repair', 1500.00, 100, 'Banjara Hills, Hyderabad', 17.4126, 78.4482, true, 'Available 24/7', CURRENT_TIMESTAMP),
(201, 'Bathroom Renovation', 'Complete bathroom renovation services including fixtures, tiles, and plumbing.', 'Plumbing', 'Bathroom Fitting', 25000.00, 100, 'Jubilee Hills, Hyderabad', 17.4274, 78.4066, true, 'Mon-Sat 9AM-6PM', CURRENT_TIMESTAMP),
(202, 'Kitchen Sink Installation', 'Professional kitchen sink and faucet installation with warranty.', 'Plumbing', 'Installation', 2500.00, 100, 'Gachibowli, Hyderabad', 17.4399, 78.3489, true, 'Mon-Fri 10AM-5PM', CURRENT_TIMESTAMP),

-- Electrical Services
(203, 'Home Electrical Wiring', 'Complete electrical wiring for new homes and rewiring for old houses.', 'Electrical', 'Wiring', 8000.00, 101, 'Madhapur, Hyderabad', 17.4479, 78.3915, true, 'Mon-Sat 8AM-8PM', CURRENT_TIMESTAMP),
(204, 'Ceiling Fan Installation', 'Professional ceiling fan installation and repair services.', 'Electrical', 'Appliance Repair', 800.00, 101, 'Kondapur, Hyderabad', 17.4649, 78.3638, true, 'Daily 9AM-7PM', CURRENT_TIMESTAMP),
(205, 'LED Lighting Setup', 'Modern LED lighting installation for homes and offices.', 'Electrical', 'Lighting', 3500.00, 101, 'Hitec City, Hyderabad', 17.4485, 78.3908, true, 'Mon-Sat 9AM-6PM', CURRENT_TIMESTAMP),

-- Carpentry Services
(206, 'Custom Furniture Making', 'Handcrafted custom furniture designed to your specifications.', 'Carpentry', 'Furniture', 15000.00, 102, 'Secunderabad, Hyderabad', 17.4399, 78.4983, true, 'Mon-Fri 9AM-5PM', CURRENT_TIMESTAMP),
(207, 'Door and Window Repair', 'Professional repair and replacement of doors and windows.', 'Carpentry', 'Repair', 2500.00, 102, 'Begumpet, Hyderabad', 17.4435, 78.4685, true, 'Mon-Sat 8AM-6PM', CURRENT_TIMESTAMP),
(208, 'Kitchen Cabinet Installation', 'Modular kitchen cabinet design and installation.', 'Carpentry', 'Installation', 35000.00, 102, 'Ameerpet, Hyderabad', 17.4374, 78.4482, true, 'Tue-Sun 10AM-6PM', CURRENT_TIMESTAMP),

-- Cleaning Services
(209, 'Deep House Cleaning', 'Comprehensive deep cleaning service for your entire home.', 'Cleaning', 'Deep Cleaning', 3000.00, 103, 'Kukatpally, Hyderabad', 17.4851, 78.4086, true, 'Daily 8AM-8PM', CURRENT_TIMESTAMP),
(210, 'Office Cleaning Service', 'Regular office cleaning and maintenance services.', 'Cleaning', 'Office Cleaning', 2500.00, 103, 'Financial District, Hyderabad', 17.4239, 78.3373, true, 'Mon-Fri 6AM-10PM', CURRENT_TIMESTAMP),
(211, 'Carpet and Upholstery Cleaning', 'Professional carpet and furniture cleaning using eco-friendly products.', 'Cleaning', 'Specialized Cleaning', 1800.00, 103, 'Miyapur, Hyderabad', 17.5049, 78.3570, true, 'Mon-Sat 9AM-5PM', CURRENT_TIMESTAMP),

-- AC Services
(212, 'AC Installation and Setup', 'Professional AC installation with 2-year warranty on service.', 'AC Services', 'Installation', 4500.00, 104, 'Mehdipatnam, Hyderabad', 17.3969, 78.4374, true, 'Mon-Sat 9AM-7PM', CURRENT_TIMESTAMP),
(213, 'AC Repair and Maintenance', 'Quick AC repair and regular maintenance services.', 'AC Services', 'Repair', 1200.00, 104, 'LB Nagar, Hyderabad', 17.3525, 78.5521, true, 'Daily 8AM-9PM', CURRENT_TIMESTAMP),
(214, 'AC Gas Refilling', 'Professional AC gas refilling and leak detection service.', 'AC Services', 'Maintenance', 2800.00, 104, 'Dilsukhnagar, Hyderabad', 17.3687, 78.5244, true, 'Mon-Sun 10AM-8PM', CURRENT_TIMESTAMP),

-- Painting Services  
(215, 'Interior Wall Painting', 'Professional interior painting with premium quality paints.', 'Painting', 'Interior', 8500.00, 102, 'Uppal, Hyderabad', 17.4065, 78.5691, true, 'Mon-Sat 8AM-6PM', CURRENT_TIMESTAMP),
(216, 'Exterior House Painting', 'Weather-resistant exterior painting for homes and buildings.', 'Painting', 'Exterior', 12000.00, 102, 'Charminar Area, Hyderabad', 17.3616, 78.4747, true, 'Tue-Sun 7AM-5PM', CURRENT_TIMESTAMP),

-- Gardening Services
(217, 'Garden Design and Landscaping', 'Complete garden design, landscaping, and maintenance services.', 'Gardening', 'Landscaping', 18000.00, 103, 'Banjara Hills, Hyderabad', 17.4095, 78.4493, true, 'Mon-Sat 6AM-4PM', CURRENT_TIMESTAMP),
(218, 'Lawn Maintenance', 'Regular lawn cutting, trimming, and garden maintenance.', 'Gardening', 'Maintenance', 1500.00, 103, 'Jubilee Hills, Hyderabad', 17.4220, 78.4069, true, 'Daily 6AM-11AM', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Update sequence to avoid conflicts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services), true);
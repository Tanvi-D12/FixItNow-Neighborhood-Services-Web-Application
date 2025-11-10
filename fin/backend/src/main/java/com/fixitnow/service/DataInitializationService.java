package com.fixitnow.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fixitnow.model.Service;
import com.fixitnow.model.User;
import com.fixitnow.repository.ServiceRepository;
import com.fixitnow.repository.UserRepository;

// @Component - DISABLED: User will create services manually as needed
public class DataInitializationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Initialization method removed - was previously run by CommandLineRunner
    // This class is now just a utility class for manual data initialization if needed

    private void createSampleProviders() {
        List<User> providers = Arrays.asList(
            createProvider("John Plumber", "john.plumber@fixitnow.com", "+91-9876543210", 
                         "Hyderabad, Telangana", "Professional plumber with 10+ years experience"),
            createProvider("Sarah Electrician", "sarah.electric@fixitnow.com", "+91-9876543211", 
                         "Hyderabad, Telangana", "Licensed electrician specializing in home repairs"),
            createProvider("Mike Carpenter", "mike.carpenter@fixitnow.com", "+91-9876543212", 
                         "Hyderabad, Telangana", "Expert carpenter for all woodwork needs"),
            createProvider("Lisa Cleaner", "lisa.cleaner@fixitnow.com", "+91-9876543213", 
                         "Hyderabad, Telangana", "Professional home cleaning services"),
            createProvider("David AC Tech", "david.ac@fixitnow.com", "+91-9876543214", 
                         "Hyderabad, Telangana", "AC repair and maintenance specialist"),
            createProvider("Ravi Painter", "ravi.painter@fixitnow.com", "+91-9876543215", 
                         "Hyderabad, Telangana", "Professional painting contractor"),
            createProvider("Priya Gardener", "priya.garden@fixitnow.com", "+91-9876543216", 
                         "Hyderabad, Telangana", "Expert gardener and landscaper")
        );

        for (User provider : providers) {
            if (!userRepository.existsByEmail(provider.getEmail())) {
                userRepository.save(provider);
                System.out.println("Created provider: " + provider.getName());
            }
        }
    }

    private User createProvider(String name, String email, String phone, String location, String bio) {
        User provider = new User();
        provider.setName(name);
        provider.setEmail(email);
        provider.setPassword(passwordEncoder.encode("password123")); // Default password for testing
        provider.setPhone(phone);
        provider.setRole(User.Role.PROVIDER);
        provider.setLocation(location);
        provider.setBio(bio);
        provider.setIsActive(true);
        provider.setIsVerified(true);
        provider.setCreatedAt(LocalDateTime.now());
        return provider;
    }

    private void createSampleServices() {
        // Get providers from database
        User johnPlumber = userRepository.findByEmail("john.plumber@fixitnow.com").orElse(null);
        User sarahElectrician = userRepository.findByEmail("sarah.electric@fixitnow.com").orElse(null);
        User mikeCarpenter = userRepository.findByEmail("mike.carpenter@fixitnow.com").orElse(null);
        User lisaCleaner = userRepository.findByEmail("lisa.cleaner@fixitnow.com").orElse(null);
        User davidAC = userRepository.findByEmail("david.ac@fixitnow.com").orElse(null);
        User raviPainter = userRepository.findByEmail("ravi.painter@fixitnow.com").orElse(null);
        User priyaGardener = userRepository.findByEmail("priya.garden@fixitnow.com").orElse(null);

        if (johnPlumber == null || sarahElectrician == null || mikeCarpenter == null || 
            lisaCleaner == null || davidAC == null || raviPainter == null || priyaGardener == null) {
            System.out.println("ERROR: Could not find all providers. Skipping service creation.");
            return;
        }

        List<Service> services = Arrays.asList(
            // Plumbing Services
            createService("Emergency Plumbing Repair", "Quick response plumbing repairs for homes and offices. Available 24/7 for urgent issues.", 
                         "Plumbing", "Pipe Repair", BigDecimal.valueOf(1500.00), johnPlumber, "Banjara Hills, Hyderabad", 17.4126, 78.4482, "Available 24/7"),
            createService("Bathroom Renovation", "Complete bathroom renovation services including fixtures, tiles, and plumbing.", 
                         "Plumbing", "Bathroom Fitting", BigDecimal.valueOf(25000.00), johnPlumber, "Jubilee Hills, Hyderabad", 17.4274, 78.4066, "Mon-Sat 9AM-6PM"),
            createService("Kitchen Sink Installation", "Professional kitchen sink and faucet installation with warranty.", 
                         "Plumbing", "Installation", BigDecimal.valueOf(2500.00), johnPlumber, "Gachibowli, Hyderabad", 17.4399, 78.3489, "Mon-Fri 10AM-5PM"),

            // Electrical Services
            createService("Home Electrical Wiring", "Complete electrical wiring for new homes and rewiring for old houses.", 
                         "Electrical", "Wiring", BigDecimal.valueOf(8000.00), sarahElectrician, "Madhapur, Hyderabad", 17.4479, 78.3915, "Mon-Sat 8AM-8PM"),
            createService("Ceiling Fan Installation", "Professional ceiling fan installation and repair services.", 
                         "Electrical", "Appliance Repair", BigDecimal.valueOf(800.00), sarahElectrician, "Kondapur, Hyderabad", 17.4649, 78.3638, "Daily 9AM-7PM"),
            createService("LED Lighting Setup", "Modern LED lighting installation for homes and offices.", 
                         "Electrical", "Lighting", BigDecimal.valueOf(3500.00), sarahElectrician, "Hitec City, Hyderabad", 17.4485, 78.3908, "Mon-Sat 9AM-6PM"),

            // Carpentry Services
            createService("Custom Furniture Making", "Handcrafted custom furniture designed to your specifications.", 
                         "Carpentry", "Furniture", BigDecimal.valueOf(15000.00), mikeCarpenter, "Secunderabad, Hyderabad", 17.4399, 78.4983, "Mon-Fri 9AM-5PM"),
            createService("Door and Window Repair", "Professional repair and replacement of doors and windows.", 
                         "Carpentry", "Repair", BigDecimal.valueOf(2500.00), mikeCarpenter, "Begumpet, Hyderabad", 17.4435, 78.4685, "Mon-Sat 8AM-6PM"),
            createService("Kitchen Cabinet Installation", "Modular kitchen cabinet design and installation.", 
                         "Carpentry", "Installation", BigDecimal.valueOf(35000.00), mikeCarpenter, "Ameerpet, Hyderabad", 17.4374, 78.4482, "Tue-Sun 10AM-6PM"),

            // Cleaning Services
            createService("Deep House Cleaning", "Comprehensive deep cleaning service for your entire home.", 
                         "Cleaning", "Deep Cleaning", BigDecimal.valueOf(3000.00), lisaCleaner, "Kukatpally, Hyderabad", 17.4851, 78.4086, "Daily 8AM-8PM"),
            createService("Office Cleaning Service", "Regular office cleaning and maintenance services.", 
                         "Cleaning", "Office Cleaning", BigDecimal.valueOf(2500.00), lisaCleaner, "Financial District, Hyderabad", 17.4239, 78.3373, "Mon-Fri 6AM-10PM"),
            createService("Carpet and Upholstery Cleaning", "Professional carpet and furniture cleaning using eco-friendly products.", 
                         "Cleaning", "Specialized Cleaning", BigDecimal.valueOf(1800.00), lisaCleaner, "Miyapur, Hyderabad", 17.5049, 78.3570, "Mon-Sat 9AM-5PM"),

            // AC Services
            createService("AC Installation and Setup", "Professional AC installation with 2-year warranty on service.", 
                         "AC Services", "Installation", BigDecimal.valueOf(4500.00), davidAC, "Mehdipatnam, Hyderabad", 17.3969, 78.4374, "Mon-Sat 9AM-7PM"),
            createService("AC Repair and Maintenance", "Quick AC repair and regular maintenance services.", 
                         "AC Services", "Repair", BigDecimal.valueOf(1200.00), davidAC, "LB Nagar, Hyderabad", 17.3525, 78.5521, "Daily 8AM-9PM"),
            createService("AC Gas Refilling", "Professional AC gas refilling and leak detection service.", 
                         "AC Services", "Maintenance", BigDecimal.valueOf(2800.00), davidAC, "Dilsukhnagar, Hyderabad", 17.3687, 78.5244, "Mon-Sun 10AM-8PM"),

            // Painting Services  
            createService("Interior Wall Painting", "Professional interior painting with premium quality paints.", 
                         "Painting", "Interior", BigDecimal.valueOf(8500.00), raviPainter, "Uppal, Hyderabad", 17.4065, 78.5691, "Mon-Sat 8AM-6PM"),
            createService("Exterior House Painting", "Weather-resistant exterior painting for homes and buildings.", 
                         "Painting", "Exterior", BigDecimal.valueOf(12000.00), raviPainter, "Charminar Area, Hyderabad", 17.3616, 78.4747, "Tue-Sun 7AM-5PM"),

            // Gardening Services
            createService("Garden Design and Landscaping", "Complete garden design, landscaping, and maintenance services.", 
                         "Gardening", "Landscaping", BigDecimal.valueOf(18000.00), priyaGardener, "Banjara Hills, Hyderabad", 17.4095, 78.4493, "Mon-Sat 6AM-4PM"),
            createService("Lawn Maintenance", "Regular lawn cutting, trimming, and garden maintenance.", 
                         "Gardening", "Maintenance", BigDecimal.valueOf(1500.00), priyaGardener, "Jubilee Hills, Hyderabad", 17.4220, 78.4069, "Daily 6AM-11AM")
        );

        for (Service service : services) {
            serviceRepository.save(service);
            System.out.println("Created service: " + service.getTitle());
        }
    }

    private Service createService(String title, String description, String category, String subcategory, 
                                BigDecimal price, User provider, String location, Double latitude, Double longitude, String availability) {
        Service service = new Service();
        service.setTitle(title);
        service.setDescription(description);
        service.setCategory(category);
        service.setSubcategory(subcategory);
        service.setPrice(price);
        service.setProvider(provider);
        service.setLocation(location);
        service.setLatitude(latitude);
        service.setLongitude(longitude);
        service.setAvailability(availability);
        service.setActive(true);
        service.setCreatedAt(LocalDateTime.now());
        return service;
    }
}
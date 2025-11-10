package com.fixitnow.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.dto.ServiceRequest;
import com.fixitnow.model.Service;
import com.fixitnow.model.User;
import com.fixitnow.repository.ServiceRepository;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.security.UserPrincipal;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/services")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {
        
        try {
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Service> services;
            
            if (search != null && !search.trim().isEmpty()) {
                services = serviceRepository.findBySearchCriteria(
                    search.trim(), category, subcategory, location, pageable);
            } else {
                services = serviceRepository.findByFilterCriteria(
                    category, subcategory, location, pageable);
            }
            
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching services: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Long id) {
        Optional<Service> service = serviceRepository.findByIdAndIsActiveTrue(id);
        if (service.isPresent()) {
            return ResponseEntity.ok(service.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> createService(@Valid @RequestBody ServiceRequest serviceRequest,
                                         @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null) {
                System.out.println("ERROR: UserPrincipal is null - user not authenticated");
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            System.out.println("DEBUG ServiceController - UserPrincipal: " + userPrincipal);
            System.out.println("DEBUG ServiceController - UserPrincipal ID: " + userPrincipal.getId());
            System.out.println("DEBUG ServiceController - UserPrincipal Email: " + userPrincipal.getUsername());
            System.out.println("DEBUG ServiceController - UserPrincipal Authorities: " + userPrincipal.getAuthorities());
            
            // Fetch user fresh from database to get latest role
            User provider = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));
            
            System.out.println("DEBUG: User role from database: " + provider.getRole());
            
            // Verify user has PROVIDER or ADMIN role
            if (!provider.getRole().equals(User.Role.PROVIDER) && !provider.getRole().equals(User.Role.ADMIN)) {
                System.out.println("ERROR: User " + userPrincipal.getUsername() + " has role " + provider.getRole() + " which is not PROVIDER or ADMIN");
                return ResponseEntity.status(403).body("Permission denied. You need PROVIDER role to create services.");
            }

            Service service = new Service();
            service.setTitle(serviceRequest.getTitle());
            service.setDescription(serviceRequest.getDescription());
            service.setCategory(serviceRequest.getCategory());
            service.setSubcategory(serviceRequest.getSubcategory());
            service.setPrice(serviceRequest.getPrice());
            service.setLocation(serviceRequest.getLocation());
            service.setLatitude(serviceRequest.getLatitude());
            service.setLongitude(serviceRequest.getLongitude());
            service.setAvailability(serviceRequest.getAvailability());
            service.setServiceImages(serviceRequest.getServiceImages());
            service.setProvider(provider);
            service.setIsActive(true);
            service.setCreatedAt(LocalDateTime.now());

            Service savedService = serviceRepository.save(service);
            System.out.println("DEBUG: Service created successfully with ID: " + savedService.getId());
            return ResponseEntity.ok(savedService);
        } catch (Exception e) {
            System.out.println("ERROR creating service: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating service: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateService(@PathVariable Long id,
                                         @Valid @RequestBody ServiceRequest serviceRequest,
                                         @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            Optional<Service> serviceOpt = serviceRepository.findById(id);
            if (!serviceOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Service service = serviceOpt.get();
            
            // Check if user owns this service or is admin
            if (!service.getProvider().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied");
            }

            service.setTitle(serviceRequest.getTitle());
            service.setDescription(serviceRequest.getDescription());
            service.setCategory(serviceRequest.getCategory());
            service.setSubcategory(serviceRequest.getSubcategory());
            service.setPrice(serviceRequest.getPrice());
            service.setLocation(serviceRequest.getLocation());
            service.setLatitude(serviceRequest.getLatitude());
            service.setLongitude(serviceRequest.getLongitude());
            service.setAvailability(serviceRequest.getAvailability());
            service.setServiceImages(serviceRequest.getServiceImages());

            Service updatedService = serviceRepository.save(service);
            return ResponseEntity.ok(updatedService);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating service: " + e.getMessage());
        }
    }



    @GetMapping("/my-services")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyServices(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            System.out.println("DEBUG /my-services - UserPrincipal: " + userPrincipal);
            System.out.println("DEBUG /my-services - UserPrincipal ID: " + userPrincipal.getId());
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // Get all non-deleted services by this provider (both active and inactive)
            // This filters out soft-deleted services so they don't appear in the provider's list
            Page<Service> services = serviceRepository.findByProviderIdAndIsDeletedFalse(
                userPrincipal.getId(), pageable);
            
            System.out.println("DEBUG /my-services - Found " + services.getTotalElements() + " non-deleted services for provider " + userPrincipal.getId());
            
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            System.out.println("DEBUG /my-services - Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching your services: " + e.getMessage());
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            List<String> categories = serviceRepository.findDistinctCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching categories: " + e.getMessage());
        }
    }

    @GetMapping("/categories/{category}/subcategories")
    public ResponseEntity<?> getSubcategories(@PathVariable String category) {
        try {
            List<String> subcategories = serviceRepository.findDistinctSubcategoriesByCategory(category);
            return ResponseEntity.ok(subcategories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching subcategories: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateServiceStatus(@PathVariable Long id, 
                                               @RequestBody Map<String, Object> request,
                                               @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            System.out.println("DEBUG: Received status update request for service " + id);
            System.out.println("DEBUG: Request body: " + request);
            System.out.println("DEBUG: User principal: " + (userPrincipal != null ? userPrincipal.getId() : "null"));
            
            if (userPrincipal == null) {
                System.out.println("DEBUG: User not authenticated");
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }
            
            Optional<Service> serviceOpt = serviceRepository.findById(id);
            if (!serviceOpt.isPresent()) {
                System.out.println("DEBUG: Service not found with id: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
            }
            
            Service service = serviceOpt.get();
            System.out.println("DEBUG: Found service: " + service.getTitle() + " (current status: " + service.getIsActive() + ")");
            System.out.println("DEBUG: Service provider ID: " + service.getProvider().getId());
            
            // Check if user is the owner of the service or admin
            if (!service.getProvider().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                System.out.println("DEBUG: Access denied - user " + userPrincipal.getId() + " is not owner of service");
                return ResponseEntity.status(403).body(Map.of("error", "You can only update your own services"));
            }
            
            // Handle both 'active' and 'isActive' field names for flexibility
            Boolean isActive = null;
            Object activeValue = request.get("active");
            Object isActiveValue = request.get("isActive");
            
            System.out.println("DEBUG: 'active' value: " + activeValue + " (type: " + (activeValue != null ? activeValue.getClass() : "null") + ")");
            System.out.println("DEBUG: 'isActive' value: " + isActiveValue + " (type: " + (isActiveValue != null ? isActiveValue.getClass() : "null") + ")");
            
            // More robust boolean parsing
            if (activeValue != null) {
                if (activeValue instanceof Boolean) {
                    isActive = (Boolean) activeValue;
                } else if (activeValue instanceof String) {
                    isActive = Boolean.parseBoolean((String) activeValue);
                } else {
                    isActive = Boolean.valueOf(activeValue.toString());
                }
            } else if (isActiveValue != null) {
                if (isActiveValue instanceof Boolean) {
                    isActive = (Boolean) isActiveValue;
                } else if (isActiveValue instanceof String) {
                    isActive = Boolean.parseBoolean((String) isActiveValue);
                } else {
                    isActive = Boolean.valueOf(isActiveValue.toString());
                }
            }
            
            System.out.println("DEBUG: Parsed isActive value: " + isActive);
            
            if (isActive == null) {
                System.out.println("DEBUG: No valid active status provided");
                return ResponseEntity.badRequest().body(Map.of("error", "Active status is required"));
            }
            
            // Log the status change for debugging
            System.out.println("DEBUG: Updating service " + id + " status from " + service.getIsActive() + " to " + isActive);
            
            service.setIsActive(isActive);
            Service updatedService = serviceRepository.save(service);
            
            System.out.println("DEBUG: Successfully updated service status to: " + updatedService.getIsActive());
            
            // Return success response with the updated service
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Service status updated successfully",
                "service", updatedService
            ));
        } catch (ClassCastException e) {
            System.err.println("ERROR: Class cast exception in status update: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid data type for status field"));
        } catch (Exception e) {
            System.err.println("ERROR updating service status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating service status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteService(@PathVariable Long id,
                                         @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            System.out.println("DEBUG: Delete request for service " + id + " by user " + (userPrincipal != null ? userPrincipal.getId() : "null"));
            
            if (userPrincipal == null) {
                System.out.println("DEBUG: Delete failed - user not authenticated");
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }
            
            Optional<Service> serviceOpt = serviceRepository.findById(id);
            if (!serviceOpt.isPresent()) {
                System.out.println("DEBUG: Delete failed - service " + id + " not found");
                return ResponseEntity.status(404).body(Map.of("error", "Service not found"));
            }
            
            Service service = serviceOpt.get();
            System.out.println("DEBUG: Found service to delete: " + service.getTitle() + " (current status: " + service.getIsActive() + ")");
            System.out.println("DEBUG: Service provider ID: " + service.getProvider().getId() + ", User ID: " + userPrincipal.getId());
            
            // Check if user is the owner of the service or admin
            if (!service.getProvider().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                System.out.println("DEBUG: Delete failed - access denied for user " + userPrincipal.getId());
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            // Perform hard delete - completely remove from database
            System.out.println("DEBUG: Performing hard delete - removing service from database");
            serviceRepository.delete(service);
            System.out.println("DEBUG: Service hard deleted successfully - completely removed from database");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Service deleted successfully"
            ));
        } catch (Exception e) {
            System.err.println("ERROR deleting service " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error deleting service: " + e.getMessage()));
        }
    }

    // Map-related endpoints
    @GetMapping("/map")
    public ResponseEntity<List<Service>> getAllServicesForMap() {
        try {
            List<Service> services = serviceRepository.findAllWithCoordinates();
            System.out.println("DEBUG: Found " + services.size() + " services with coordinates");
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            System.err.println("ERROR fetching services for map: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/map/bounds")
    public ResponseEntity<List<Service>> getServicesInBounds(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {
        try {
            List<Service> services = serviceRepository.findServicesInBounds(minLat, maxLat, minLng, maxLng);
            System.out.println("DEBUG: Found " + services.size() + " services in bounds");
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            System.err.println("ERROR fetching services in bounds: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/map/nearby")
    public ResponseEntity<List<Service>> getServicesNearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "10") Double radiusKm) {
        try {
            List<Service> services = serviceRepository.findServicesWithinRadius(lat, lng, radiusKm);
            System.out.println("DEBUG: Found " + services.size() + " services within " + radiusKm + "km");
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            System.err.println("ERROR fetching nearby services: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/location")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<Service> updateServiceLocation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> locationData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Service> serviceOpt = serviceRepository.findById(id);
            if (!serviceOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Service service = serviceOpt.get();
            
            // Check authorization
            if (!service.getProvider().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).build();
            }

            // Update location data
            if (locationData.containsKey("location")) {
                service.setLocation((String) locationData.get("location"));
            }
            if (locationData.containsKey("latitude")) {
                service.setLatitude(((Number) locationData.get("latitude")).doubleValue());
            }
            if (locationData.containsKey("longitude")) {
                service.setLongitude(((Number) locationData.get("longitude")).doubleValue());
            }

            Service savedService = serviceRepository.save(service);
            System.out.println("DEBUG: Updated service location for service " + id);
            return ResponseEntity.ok(savedService);
        } catch (Exception e) {
            System.err.println("ERROR updating service location: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/subcategories")
    public ResponseEntity<List<String>> getDistinctSubcategories(@RequestParam String category) {
        try {
            List<String> subcategories = serviceRepository.findDistinctSubcategoriesByCategory(category);
            System.out.println("DEBUG: Found " + subcategories.size() + " subcategories for category: " + category);
            return ResponseEntity.ok(subcategories);
        } catch (Exception e) {
            System.err.println("ERROR fetching subcategories: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/debug/count")
    public ResponseEntity<?> getServicesCount() {
        try {
            long totalServices = serviceRepository.count();
            long activeServices = serviceRepository.findAll().stream()
                .filter(Service::getActive)
                .count();
            long servicesWithCoordinates = serviceRepository.findAllWithCoordinates().size();
            
            Map<String, Object> counts = Map.of(
                "totalServices", totalServices,
                "activeServices", activeServices, 
                "servicesWithCoordinates", servicesWithCoordinates,
                "message", totalServices == 0 ? "No services found in database" : "Services exist in database"
            );
            
            System.out.println("DEBUG: Service counts - Total: " + totalServices + ", Active: " + activeServices + ", WithCoordinates: " + servicesWithCoordinates);
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            System.err.println("ERROR getting service counts: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Simple GET endpoint to create sample data (for testing only)
    @GetMapping("/debug/init-sample-data")
    public ResponseEntity<?> initSampleData() {
        try {
            // Check if services already exist
            long serviceCount = serviceRepository.count();
            if (serviceCount > 0) {
                return ResponseEntity.ok(Map.of(
                    "message", "Sample data already exists",
                    "existingServices", serviceCount
                ));
            }

            // Create a sample provider if none exists
            User provider = userRepository.findByRole(User.Role.PROVIDER).stream().findFirst()
                .orElseGet(() -> {
                    User sampleProvider = new User();
                    sampleProvider.setName("Sample Provider");
                    sampleProvider.setEmail("provider@example.com");
                    sampleProvider.setPhone("1234567890");
                    sampleProvider.setRole(User.Role.PROVIDER);
                    sampleProvider.setLocation("Delhi, India");
                    sampleProvider.setIsActive(true);
                    sampleProvider.setIsVerified(true);
                    return userRepository.save(sampleProvider);
                });

            // Create sample services with coordinates
            createSampleServicesWithProvider(provider);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sample data initialized successfully",
                "services", serviceRepository.count()
            ));
        } catch (Exception e) {
            System.err.println("ERROR initializing sample data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Debug endpoint to create sample services (for development only)
    @PostMapping("/debug/create-samples")
    public ResponseEntity<?> createSampleServices(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // For testing, allow creation without authentication if no provider exists
            User provider = null;
            if (userPrincipal != null) {
                provider = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            } else {
                // Try to find any existing provider, or create a sample one
                provider = userRepository.findByRole(User.Role.PROVIDER).stream().findFirst()
                    .orElseGet(() -> {
                        User sampleProvider = new User();
                        sampleProvider.setName("Sample Provider");
                        sampleProvider.setEmail("provider@example.com");
                        sampleProvider.setPhone("1234567890");
                        sampleProvider.setRole(User.Role.PROVIDER);
                        sampleProvider.setLocation("Delhi, India");
                        sampleProvider.setIsActive(true);
                        sampleProvider.setIsVerified(true);
                        return userRepository.save(sampleProvider);
                    });
            }

            // Create sample services
            createSampleServicesWithProvider(provider);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sample services created successfully"
            ));
        } catch (Exception e) {
            System.err.println("ERROR creating sample services: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating sample services: " + e.getMessage());
        }
    }

    // Helper method to create sample services
    private void createSampleServicesWithProvider(User provider) {
        // Sample services with coordinates (Delhi area)
        String[][] sampleServices = {
            {"Electrical Wiring Service", "Electrical", "Wiring", "Professional electrical wiring for homes and offices", "500", "Connaught Place, Delhi", "28.6315", "77.2167"},
            {"Plumbing Repair", "Plumbing", "Pipe Repair", "Quick and reliable plumbing repair services", "400", "India Gate, Delhi", "28.6129", "77.2295"},
            {"House Cleaning", "Cleaning", "House Cleaning", "Professional house cleaning services", "300", "Khan Market, Delhi", "28.5984", "77.2319"},
            {"AC Installation", "HVAC", "Installation", "Air conditioning installation and maintenance", "800", "Lajpat Nagar, Delhi", "28.5677", "77.2437"},
            {"Carpentry Work", "Carpentry", "Custom Furniture", "Custom furniture and carpentry services", "600", "Karol Bagh, Delhi", "28.6519", "77.1909"},
            {"Garden Maintenance", "Gardening", "Lawn Care", "Complete garden and lawn maintenance services", "350", "Vasant Vihar, Delhi", "28.5672", "77.1574"},
            {"Wall Painting Service", "Painting", "Interior Painting", "Professional interior and exterior painting", "450", "South Extension, Delhi", "28.5706", "77.2226"},
            {"Mobile Repair", "Electronics", "Phone Repair", "Quick mobile phone repair services", "200", "Nehru Place, Delhi", "28.5494", "77.2519"}
        };

        for (String[] serviceData : sampleServices) {
            Service service = new Service();
            service.setTitle(serviceData[0]);
            service.setCategory(serviceData[1]);
            service.setSubcategory(serviceData[2]);
            service.setDescription(serviceData[3]);
            service.setPrice(new java.math.BigDecimal(serviceData[4]));
            service.setLocation(serviceData[5]);
            service.setLatitude(Double.parseDouble(serviceData[6]));
            service.setLongitude(Double.parseDouble(serviceData[7]));
            service.setProvider(provider);
            service.setIsActive(true);
            service.setCreatedAt(LocalDateTime.now());

            serviceRepository.save(service);
        }
    }
}
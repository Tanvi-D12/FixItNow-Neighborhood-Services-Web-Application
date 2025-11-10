package com.fixitnow.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.dto.AnalyticsDashboardDTO;
import com.fixitnow.dto.AnalyticsDashboardDTO.LocationTrendDTO;
import com.fixitnow.dto.AnalyticsDashboardDTO.MetricsDTO;
import com.fixitnow.dto.AnalyticsDashboardDTO.TopProviderDTO;
import com.fixitnow.dto.AnalyticsDashboardDTO.TopServiceDTO;
import com.fixitnow.model.Booking;
import com.fixitnow.model.Review;
import com.fixitnow.model.Service;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.ReviewRepository;
import com.fixitnow.repository.ServiceRepository;
import com.fixitnow.repository.UserRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAnalyticsDashboard() {
        try {
            System.out.println("DEBUG: Fetching analytics dashboard data");

            // 1. Get Key Metrics
            long totalBookings = bookingRepository.count();
            long activeServices = serviceRepository.findByIsActiveTrueAndIsDeletedFalse().size();
            long totalUsers = userRepository.findByIsDeletedFalse().size();

            // Calculate total revenue from bookings
            Double totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getService() != null && b.getService().getPrice() != null)
                .mapToDouble(b -> Double.parseDouble(String.valueOf(b.getService().getPrice())))
                .sum();

            // Calculate average rating
            Double avgRating = 4.5; // Default, can be improved with aggregation
            List<Review> allReviews = reviewRepository.findAll();
            if (!allReviews.isEmpty()) {
                avgRating = allReviews.stream()
                    .mapToDouble(Review::getRating)
                    .average()
                    .orElse(4.5);
            }

            MetricsDTO metrics = new MetricsDTO(totalBookings, totalRevenue, activeServices, totalUsers, avgRating);
            System.out.println("DEBUG: Metrics - Bookings: " + totalBookings + ", Revenue: " + totalRevenue);

            // 2. Get Top 5 Most Booked Services
            List<Service> allServices = serviceRepository.findAll();
            List<TopServiceDTO> topServices = allServices.stream()
                .filter(s -> !s.getIsDeleted())
                .map(s -> {
                    long bookingCount = bookingRepository.findByProvider(s.getProvider()).stream()
                        .filter(b -> b.getService().getId().equals(s.getId()))
                        .count();
                    return new TopServiceDTO(s.getId(), s.getTitle(), s.getCategory(), bookingCount);
                })
                .filter(dto -> dto.getBookingCount() > 0)
                .sorted((a, b) -> Long.compare(b.getBookingCount(), a.getBookingCount()))
                .limit(5)
                .collect(Collectors.toList());

            System.out.println("DEBUG: Top Services count: " + topServices.size());

            // 3. Get Top 5 Providers by rating and bookings
            List<TopProviderDTO> topProviders = userRepository.findByRoleAndIsDeletedFalse(com.fixitnow.model.User.Role.PROVIDER).stream()
                .map(provider -> {
                    long bookingCount = bookingRepository.findByProvider(provider).size();
                    
                    Double revenue = bookingRepository.findByProvider(provider).stream()
                        .filter(b -> b.getService() != null && b.getService().getPrice() != null)
                        .mapToDouble(b -> Double.parseDouble(String.valueOf(b.getService().getPrice())))
                        .sum();

                    List<Review> providerReviews = reviewRepository.findAll().stream()
                        .filter(r -> r.getProvider() != null && r.getProvider().getId().equals(provider.getId()))
                        .collect(Collectors.toList());
                    
                    Double rating = providerReviews.isEmpty() ? 0.0 : 
                        providerReviews.stream().mapToDouble(Review::getRating).average().orElse(0.0);

                    return new TopProviderDTO(provider.getId(), provider.getName(), rating, bookingCount, revenue);
                })
                .filter(dto -> dto.getBookingCount() > 0)
                .sorted((a, b) -> Double.compare(b.getAvgRating(), a.getAvgRating()))
                .limit(5)
                .collect(Collectors.toList());

            System.out.println("DEBUG: Top Providers count: " + topProviders.size());

            // 4. Get Location Trends (Top 5 locations by bookings)
            List<LocationTrendDTO> locationTrends = bookingRepository.findAll().stream()
                .filter(b -> b.getService() != null && b.getService().getProvider() != null && 
                            b.getService().getProvider().getLocation() != null)
                .collect(Collectors.groupingBy(
                    b -> b.getService().getProvider().getLocation(),
                    Collectors.counting()
                ))
                .entrySet().stream()
                .map(entry -> new LocationTrendDTO(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> Long.compare(b.getBookingCount(), a.getBookingCount()))
                .limit(5)
                .collect(Collectors.toList());

            System.out.println("DEBUG: Location Trends count: " + locationTrends.size());

            // Combine all data
            AnalyticsDashboardDTO dashboardDTO = new AnalyticsDashboardDTO(
                metrics,
                topServices,
                topProviders,
                locationTrends
            );

            System.out.println("DEBUG: Analytics dashboard compiled successfully");
            return ResponseEntity.ok(dashboardDTO);

        } catch (Exception e) {
            System.out.println("ERROR: Failed to fetch analytics dashboard - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to fetch analytics data");
        }
    }
}

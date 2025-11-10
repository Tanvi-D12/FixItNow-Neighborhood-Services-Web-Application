package com.fixitnow.controller;

import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.dto.BookingRequest;
import com.fixitnow.model.Booking;
import com.fixitnow.model.Service;
import com.fixitnow.model.User;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.ReviewRepository;
import com.fixitnow.repository.ServiceRepository;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest bookingRequest,
                                         @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            System.out.println("DEBUG: Creating booking for service ID: " + bookingRequest.getServiceId());
            System.out.println("DEBUG: User Principal: " + userPrincipal.getUsername());
            System.out.println("DEBUG: User Authorities: " + userPrincipal.getAuthorities());
            
            // Get service
            Optional<Service> serviceOpt = serviceRepository.findByIdAndIsActiveTrue(bookingRequest.getServiceId());
            if (!serviceOpt.isPresent()) {
                System.out.println("DEBUG: Service not found or inactive for ID: " + bookingRequest.getServiceId());
                return ResponseEntity.badRequest().body("Service not found or inactive");
            }
            Service service = serviceOpt.get();
            System.out.println("DEBUG: Service found: " + service.getTitle());

            // Get customer
            User customer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
            System.out.println("DEBUG: Customer found: " + customer.getName() + " with role: " + customer.getRole());

            // Check if customer is trying to book their own service
            if (service.getProvider().getId().equals(customer.getId())) {
                System.out.println("DEBUG: Customer trying to book their own service");
                return ResponseEntity.badRequest().body("Cannot book your own service");
            }

            // Create booking
            Booking booking = new Booking();
            booking.setService(service);
            booking.setCustomer(customer);
            booking.setProvider(service.getProvider());
            booking.setBookingDate(bookingRequest.getBookingDate());
            booking.setTimeSlot(bookingRequest.getTimeSlot());
            booking.setNotes(bookingRequest.getNotes());
            booking.setUrgencyLevel(bookingRequest.getUrgencyLevel());
            booking.setStatus(Booking.BookingStatus.PENDING);
            booking.setCreatedAt(LocalDateTime.now());

            Booking savedBooking = bookingRepository.save(booking);
            System.out.println("DEBUG: Booking created successfully with ID: " + savedBooking.getId());
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            System.out.println("ERROR creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating booking: " + e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(required = false) Booking.BookingStatus status) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Booking> bookings;

            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            switch (user.getRole().name()) {
                case "CUSTOMER":
                    if (status != null) {
                        bookings = bookingRepository.findByCustomerIdAndStatus(userPrincipal.getId(), status, pageable);
                    } else {
                        bookings = bookingRepository.findByCustomerId(userPrincipal.getId(), pageable);
                    }
                    break;
                case "PROVIDER":
                    if (status != null) {
                        bookings = bookingRepository.findByProviderIdAndStatus(userPrincipal.getId(), status, pageable);
                    } else {
                        bookings = bookingRepository.findByProviderId(userPrincipal.getId(), pageable);
                    }
                    break;
                default:
                    // Admin can see all bookings
                    if (status != null) {
                        bookings = bookingRepository.findByStatus(status, pageable);
                    } else {
                        bookings = bookingRepository.findAll(pageable);
                    }
                    break;
            }

            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching bookings: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getBookingById(@PathVariable Long id,
                                          @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (!bookingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            
            // Check if user has access to this booking
            if (!booking.getCustomer().getId().equals(userPrincipal.getId()) && 
                !booking.getProvider().getId().equals(userPrincipal.getId()) &&
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied");
            }

            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching booking: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id,
                                               @RequestParam Booking.BookingStatus status,
                                               @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (!bookingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            
            // Check if user is the provider or admin
            if (!booking.getProvider().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied");
            }

            booking.setStatus(status);
            Booking updatedBooking = bookingRepository.save(booking);
            
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating booking status: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id,
                                         @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (!bookingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            
            // Check if user is the customer or admin
            if (!booking.getCustomer().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied");
            }

            // Only allow cancellation of pending bookings
            if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
                return ResponseEntity.badRequest().body("Cannot cancel completed booking");
            }

            booking.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            
            return ResponseEntity.ok().body("Booking cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error cancelling booking: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long totalBookings, pendingBookings, confirmedBookings, completedBookings;
            Double totalEarnings = 0.0;
            Long activeBookings = 0L;
            Double avgRating = 0.0;
            Long totalServices = 0L;
            
            if ("CUSTOMER".equals(user.getRole().name())) {
                // Customer stats
                Long customerId = userPrincipal.getId();
                totalBookings = bookingRepository.countByCustomerId(customerId);
                pendingBookings = bookingRepository.countByCustomerIdAndStatus(customerId, Booking.BookingStatus.PENDING);
                confirmedBookings = bookingRepository.countByCustomerIdAndStatus(customerId, Booking.BookingStatus.CONFIRMED);
                completedBookings = bookingRepository.countByCustomerIdAndStatus(customerId, Booking.BookingStatus.COMPLETED);
                activeBookings = pendingBookings + confirmedBookings;
            } else {
                // Provider stats
                Long providerId = userPrincipal.getId();
                totalBookings = bookingRepository.countByProviderId(providerId);
                pendingBookings = bookingRepository.countByProviderIdAndStatus(providerId, Booking.BookingStatus.PENDING);
                confirmedBookings = bookingRepository.countByProviderIdAndStatus(providerId, Booking.BookingStatus.CONFIRMED);
                completedBookings = bookingRepository.countByProviderIdAndStatus(providerId, Booking.BookingStatus.COMPLETED);
                activeBookings = pendingBookings + confirmedBookings;
                
                // Calculate earnings from completed bookings
                totalEarnings = bookingRepository.findByProviderIdAndStatus(providerId, Booking.BookingStatus.COMPLETED, null)
                    .getContent()
                    .stream()
                    .mapToDouble(booking -> booking.getService().getPrice().doubleValue())
                    .sum();
                
                // Get rating information
                Double averageRating = reviewRepository.findAverageRatingByProviderId(providerId);
                avgRating = averageRating != null ? averageRating : 0.0;
                
                // Get total services count
                totalServices = serviceRepository.countByProviderIdAndIsActiveTrue(providerId);
            }
            
            return ResponseEntity.ok(new BookingStats(totalBookings, pendingBookings, confirmedBookings, completedBookings, activeBookings, totalEarnings, avgRating, totalServices));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching dashboard stats: " + e.getMessage());
        }
    }

    // Inner class for stats response
    public static class BookingStats {
        private final Long totalBookings;
        private final Long pendingBookings;
        private final Long confirmedBookings;
        private final Long completedBookings;
        private final Long activeBookings;
        private final Double totalEarnings;
        private final Double avgRating;
        private final Long totalServices;

        public BookingStats(Long totalBookings, Long pendingBookings, Long confirmedBookings, Long completedBookings, Long activeBookings, Double totalEarnings, Double avgRating, Long totalServices) {
            this.totalBookings = totalBookings;
            this.pendingBookings = pendingBookings;
            this.confirmedBookings = confirmedBookings;
            this.completedBookings = completedBookings;
            this.activeBookings = activeBookings;
            this.totalEarnings = totalEarnings;
            this.avgRating = avgRating;
            this.totalServices = totalServices;
        }

        // Getters
        public Long getTotalBookings() { return totalBookings; }
        public Long getPendingBookings() { return pendingBookings; }
        public Long getConfirmedBookings() { return confirmedBookings; }
        public Long getCompletedBookings() { return completedBookings; }
        public Long getActiveBookings() { return activeBookings; }
        public Double getTotalEarnings() { return totalEarnings; }
        public Double getAvgRating() { return avgRating; }
        public Long getTotalServices() { return totalServices; }
    }
}
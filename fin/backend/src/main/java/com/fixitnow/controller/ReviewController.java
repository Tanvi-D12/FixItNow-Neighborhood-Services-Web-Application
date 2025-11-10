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

import com.fixitnow.dto.ReviewRequest;
import com.fixitnow.model.Booking;
import com.fixitnow.model.Review;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.ReviewRepository;
import com.fixitnow.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest reviewRequest,
                                        @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // Get the booking
            Optional<Booking> bookingOpt = bookingRepository.findById(reviewRequest.getBookingId());
            if (!bookingOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Booking not found");
            }
            Booking booking = bookingOpt.get();

            // Check if user is the customer who made the booking
            if (!booking.getCustomer().getId().equals(userPrincipal.getId())) {
                return ResponseEntity.status(403).body("You can only review your own bookings");
            }

            // Check if booking is completed
            if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
                return ResponseEntity.badRequest().body("You can only review completed bookings");
            }

            // Check if review already exists for this booking
            Optional<Review> existingReview = reviewRepository.findByBookingId(booking.getId());
            if (existingReview.isPresent()) {
                return ResponseEntity.badRequest().body("Review already exists for this booking");
            }

            // Create review
            Review review = new Review();
            review.setBooking(booking);
            review.setCustomer(booking.getCustomer());
            review.setProvider(booking.getProvider());
            review.setRating(reviewRequest.getRating());
            review.setComment(reviewRequest.getComment());
            review.setCreatedAt(LocalDateTime.now());

            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating review: " + e.getMessage());
        }
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getProviderReviews(@PathVariable Long providerId,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Review> reviews = reviewRepository.findByProviderId(providerId, pageable);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching reviews: " + e.getMessage());
        }
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<?> getServiceReviews(@PathVariable Long serviceId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Review> reviews = reviewRepository.findByBookingServiceId(serviceId, pageable);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching service reviews: " + e.getMessage());
        }
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyReviews(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Review> reviews = reviewRepository.findByCustomerId(userPrincipal.getId(), pageable);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching your reviews: " + e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getBookingReview(@PathVariable Long bookingId,
                                            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findByBookingId(bookingId);
            if (!reviewOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Review review = reviewOpt.get();
            
            // Check if user has access to this review (customer who made it or provider who received it)
            if (!review.getCustomer().getId().equals(userPrincipal.getId()) && 
                !review.getProvider().getId().equals(userPrincipal.getId()) &&
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied");
            }
            
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching booking review: " + e.getMessage());
        }
    }

    @GetMapping("/provider/{providerId}/stats")
    public ResponseEntity<?> getProviderRatingStats(@PathVariable Long providerId) {
        try {
            Double averageRating = reviewRepository.findAverageRatingByProviderId(providerId);
            Long totalReviews = reviewRepository.countByProviderId(providerId);
            
            return ResponseEntity.ok(new RatingStats(
                averageRating != null ? averageRating : 0.0, 
                totalReviews
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching rating stats: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateReview(@PathVariable Long id,
                                        @Valid @RequestBody ReviewRequest reviewRequest,
                                        @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (!reviewOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Review review = reviewOpt.get();
            
            // Check if user owns this review
            if (!review.getCustomer().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied");
            }

            review.setRating(reviewRequest.getRating());
            review.setComment(reviewRequest.getComment());

            Review updatedReview = reviewRepository.save(review);
            return ResponseEntity.ok(updatedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating review: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id,
                                        @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (!reviewOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Review review = reviewOpt.get();
            
            // Check if user owns this review
            if (!review.getCustomer().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Access denied");
            }

            reviewRepository.delete(review);
            return ResponseEntity.ok().body("Review deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting review: " + e.getMessage());
        }
    }

    // Inner class for rating stats
    public static class RatingStats {
        private final Double averageRating;
        private final Long totalReviews;

        public RatingStats(Double averageRating, Long totalReviews) {
            this.averageRating = averageRating;
            this.totalReviews = totalReviews;
        }

        public Double getAverageRating() { return averageRating; }
        public Long getTotalReviews() { return totalReviews; }
    }
}
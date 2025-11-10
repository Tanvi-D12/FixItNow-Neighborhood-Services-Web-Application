package com.fixitnow.repository;

import com.fixitnow.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Page<Review> findByProviderId(Long providerId, Pageable pageable);
    
    Page<Review> findByCustomerId(Long customerId, Pageable pageable);
    
    @Query("SELECT r FROM Review r WHERE r.booking.service.id = :serviceId")
    Page<Review> findByBookingServiceId(@Param("serviceId") Long serviceId, Pageable pageable);
    
    Optional<Review> findByBookingId(Long bookingId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.provider.id = :providerId")
    Double findAverageRatingByProviderId(@Param("providerId") Long providerId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.provider.id = :providerId")
    Long countByProviderId(@Param("providerId") Long providerId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.provider.id = :providerId AND r.rating = :rating")
    Long countByProviderIdAndRating(@Param("providerId") Long providerId, @Param("rating") Integer rating);
}
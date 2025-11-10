package com.fixitnow.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fixitnow.model.Booking;
import com.fixitnow.model.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(User customer);
    
    List<Booking> findByProvider(User provider);
    
    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);
    
    Page<Booking> findByProviderId(Long providerId, Pageable pageable);
    
    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);
    
    Page<Booking> findByCustomerIdAndStatus(Long customerId, Booking.BookingStatus status, Pageable pageable);
    
    Page<Booking> findByProviderIdAndStatus(Long providerId, Booking.BookingStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.provider.id = :providerId")
    Long countByProviderId(@Param("providerId") Long providerId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.provider.id = :providerId AND b.status = :status")
    Long countByProviderIdAndStatus(@Param("providerId") Long providerId, @Param("status") Booking.BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.customer.id = :customerId")
    Long countByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.customer.id = :customerId AND b.status = :status")
    Long countByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") Booking.BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.provider.id = :providerId AND b.bookingDate = :date")
    List<Booking> findByProviderAndDate(@Param("providerId") Long providerId, @Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerOrderByCreatedAtDesc(@Param("customerId") Long customerId);
    
    @Query("SELECT b FROM Booking b WHERE b.provider.id = :providerId ORDER BY b.createdAt DESC")
    List<Booking> findByProviderOrderByCreatedAtDesc(@Param("providerId") Long providerId);
}
package com.fixitnow.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookingRequest {
    @NotNull
    private Long serviceId;

    @NotNull
    @FutureOrPresent
    private LocalDate bookingDate;

    @NotBlank
    private String timeSlot;

    private String notes;
    
    private String urgencyLevel;

    // Constructors
    public BookingRequest() {}

    public BookingRequest(Long serviceId, LocalDate bookingDate, String timeSlot, String notes, String urgencyLevel) {
        this.serviceId = serviceId;
        this.bookingDate = bookingDate;
        this.timeSlot = timeSlot;
        this.notes = notes;
        this.urgencyLevel = urgencyLevel;
    }

    // Getters and Setters
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(String urgencyLevel) { this.urgencyLevel = urgencyLevel; }
}
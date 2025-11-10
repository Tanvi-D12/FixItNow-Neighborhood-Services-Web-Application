package com.fixitnow.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ServiceRequest {
    @NotBlank
    @Size(min = 5, max = 100)
    private String title;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String description;

    @NotBlank
    private String category;

    @NotBlank
    private String subcategory;

    @NotNull
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotBlank
    private String location;

    private Double latitude;

    private Double longitude;

    private String availability; // JSON string for availability slots

    private String serviceImages; // Comma-separated image URLs

    // Constructors
    public ServiceRequest() {}

    public ServiceRequest(String title, String description, String category, String subcategory, 
                         BigDecimal price, String location, String availability, String serviceImages) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.subcategory = subcategory;
        this.price = price;
        this.location = location;
        this.availability = availability;
        this.serviceImages = serviceImages;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getServiceImages() { return serviceImages; }
    public void setServiceImages(String serviceImages) { this.serviceImages = serviceImages; }
}
package com.fixitnow.dto;

import java.util.List;

public class AnalyticsDashboardDTO {
    
    private MetricsDTO metrics;
    private List<TopServiceDTO> topServices;
    private List<TopProviderDTO> topProviders;
    private List<LocationTrendDTO> locationTrends;

    public AnalyticsDashboardDTO() {}

    public AnalyticsDashboardDTO(MetricsDTO metrics, List<TopServiceDTO> topServices, 
                                 List<TopProviderDTO> topProviders, List<LocationTrendDTO> locationTrends) {
        this.metrics = metrics;
        this.topServices = topServices;
        this.topProviders = topProviders;
        this.locationTrends = locationTrends;
    }

    public MetricsDTO getMetrics() { return metrics; }
    public void setMetrics(MetricsDTO metrics) { this.metrics = metrics; }

    public List<TopServiceDTO> getTopServices() { return topServices; }
    public void setTopServices(List<TopServiceDTO> topServices) { this.topServices = topServices; }

    public List<TopProviderDTO> getTopProviders() { return topProviders; }
    public void setTopProviders(List<TopProviderDTO> topProviders) { this.topProviders = topProviders; }

    public List<LocationTrendDTO> getLocationTrends() { return locationTrends; }
    public void setLocationTrends(List<LocationTrendDTO> locationTrends) { this.locationTrends = locationTrends; }

    // Inner DTOs
    public static class MetricsDTO {
        private Long totalBookings;
        private Double totalRevenue;
        private Long activeServices;
        private Long totalUsers;
        private Double avgRating;

        public MetricsDTO() {}

        public MetricsDTO(Long totalBookings, Double totalRevenue, Long activeServices, 
                         Long totalUsers, Double avgRating) {
            this.totalBookings = totalBookings;
            this.totalRevenue = totalRevenue;
            this.activeServices = activeServices;
            this.totalUsers = totalUsers;
            this.avgRating = avgRating;
        }

        public Long getTotalBookings() { return totalBookings; }
        public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }

        public Double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }

        public Long getActiveServices() { return activeServices; }
        public void setActiveServices(Long activeServices) { this.activeServices = activeServices; }

        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

        public Double getAvgRating() { return avgRating; }
        public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }
    }

    public static class TopServiceDTO {
        private Long id;
        private String title;
        private String category;
        private Long bookingCount;

        public TopServiceDTO() {}

        public TopServiceDTO(Long id, String title, String category, Long bookingCount) {
            this.id = id;
            this.title = title;
            this.category = category;
            this.bookingCount = bookingCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Long getBookingCount() { return bookingCount; }
        public void setBookingCount(Long bookingCount) { this.bookingCount = bookingCount; }
    }

    public static class TopProviderDTO {
        private Long id;
        private String name;
        private Double avgRating;
        private Long bookingCount;
        private Double totalEarnings;

        public TopProviderDTO() {}

        public TopProviderDTO(Long id, String name, Double avgRating, Long bookingCount, Double totalEarnings) {
            this.id = id;
            this.name = name;
            this.avgRating = avgRating;
            this.bookingCount = bookingCount;
            this.totalEarnings = totalEarnings;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Double getAvgRating() { return avgRating; }
        public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

        public Long getBookingCount() { return bookingCount; }
        public void setBookingCount(Long bookingCount) { this.bookingCount = bookingCount; }

        public Double getTotalEarnings() { return totalEarnings; }
        public void setTotalEarnings(Double totalEarnings) { this.totalEarnings = totalEarnings; }
    }

    public static class LocationTrendDTO {
        private String location;
        private Long bookingCount;

        public LocationTrendDTO() {}

        public LocationTrendDTO(String location, Long bookingCount) {
            this.location = location;
            this.bookingCount = bookingCount;
        }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public Long getBookingCount() { return bookingCount; }
        public void setBookingCount(Long bookingCount) { this.bookingCount = bookingCount; }
    }
}

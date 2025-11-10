package com.fixitnow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fixitnow.model.Service;
import com.fixitnow.model.User;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByProvider(User provider);
    
    List<Service> findByCategoryAndIsActive(String category, Boolean isActive);
    
    List<Service> findBySubcategoryAndIsActive(String subcategory, Boolean isActive);
    
    List<Service> findByIsDeletedFalse();
    
    List<Service> findByIsDeletedTrue();
    
    List<Service> findByIsActiveTrueAndIsDeletedFalse();
    
    Optional<Service> findByIdAndIsActiveTrue(Long id);
    
    Page<Service> findByProviderIdAndIsActiveTrue(Long providerId, Pageable pageable);
    
    Page<Service> findByProviderId(Long providerId, Pageable pageable);
    
    Page<Service> findByProviderIdAndIsDeletedFalse(Long providerId, Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.category = :category AND s.location LIKE %:location% AND s.isActive = true")
    List<Service> findByCategoryAndLocation(@Param("category") String category, @Param("location") String location);
    
    @Query("SELECT s FROM Service s WHERE s.location LIKE %:location% AND s.isActive = true")
    List<Service> findByLocationContaining(@Param("location") String location);
    
    @Query("SELECT s FROM Service s WHERE (s.title LIKE %:keyword% OR s.category LIKE %:keyword% OR s.subcategory LIKE %:keyword% OR s.description LIKE %:keyword%) AND s.isActive = true")
    List<Service> searchServices(@Param("keyword") String keyword);
    
    @Query("SELECT s FROM Service s WHERE s.provider.id = :providerId AND s.isActive = true")
    List<Service> findActiveServicesByProvider(@Param("providerId") Long providerId);
    
    @Query("SELECT DISTINCT s.category FROM Service s WHERE s.isActive = true ORDER BY s.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT DISTINCT s.subcategory FROM Service s WHERE s.category = :category AND s.isActive = true ORDER BY s.subcategory")
    List<String> findDistinctSubcategoriesByCategory(@Param("category") String category);
    
    @Query("SELECT s FROM Service s WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " s.title LIKE %:search% OR s.description LIKE %:search% OR " +
           " s.category LIKE %:search% OR s.subcategory LIKE %:search%) AND " +
           "(:category IS NULL OR :category = '' OR s.category = :category) AND " +
           "(:subcategory IS NULL OR :subcategory = '' OR s.subcategory = :subcategory) AND " +
           "(:location IS NULL OR :location = '' OR s.location LIKE %:location%) AND " +
           "s.isActive = true")
    Page<Service> findBySearchCriteria(@Param("search") String search,
                                     @Param("category") String category,
                                     @Param("subcategory") String subcategory,
                                     @Param("location") String location,
                                     Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE " +
           "(:category IS NULL OR :category = '' OR s.category = :category) AND " +
           "(:subcategory IS NULL OR :subcategory = '' OR s.subcategory = :subcategory) AND " +
           "(:location IS NULL OR :location = '' OR s.location LIKE %:location%) AND " +
           "s.isActive = true")
    Page<Service> findByFilterCriteria(@Param("category") String category,
                                     @Param("subcategory") String subcategory,
                                     @Param("location") String location,
                                     Pageable pageable);

    // Location-based queries for map search
    @Query("SELECT s FROM Service s WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL AND s.isActive = true AND s.isDeleted = false")
    List<Service> findAllWithCoordinates();

    @Query("SELECT s FROM Service s WHERE " +
           "s.latitude BETWEEN :minLat AND :maxLat AND " +
           "s.longitude BETWEEN :minLng AND :maxLng AND " +
           "s.isActive = true AND s.isDeleted = false")
    List<Service> findServicesInBounds(@Param("minLat") Double minLat,
                                     @Param("maxLat") Double maxLat,
                                     @Param("minLng") Double minLng,
                                     @Param("maxLng") Double maxLng);

    @Query(value = "SELECT *, " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(latitude)))) AS distance " +
           "FROM services " +
           "WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_active = true AND is_deleted = false " +
           "HAVING distance <= :radiusKm " +
           "ORDER BY distance",
           nativeQuery = true)
    List<Service> findServicesWithinRadius(@Param("lat") Double lat,
                                         @Param("lng") Double lng,
                                         @Param("radiusKm") Double radiusKm);
    
    Long countByProviderIdAndIsActiveTrue(Long providerId);
}
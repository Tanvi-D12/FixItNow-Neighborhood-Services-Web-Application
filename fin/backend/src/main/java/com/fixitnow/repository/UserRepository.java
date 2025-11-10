package com.fixitnow.repository;

import com.fixitnow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByRoleAndIsVerified(User.Role role, Boolean isVerified);
    
    List<User> findByIsDeletedFalse();
    
    List<User> findByIsDeletedTrue();
    
    List<User> findByRoleAndIsDeletedFalse(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.location LIKE %:location%")
    List<User> findProvidersByLocation(@Param("role") User.Role role, @Param("location") String location);
    
    @Query("SELECT u FROM User u WHERE u.role = 'PROVIDER' AND u.isActive = true AND u.isVerified = true")
    List<User> findActiveVerifiedProviders();
}
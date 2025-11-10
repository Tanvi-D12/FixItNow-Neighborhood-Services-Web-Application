package com.fixitnow.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fixitnow.model.User;
import com.fixitnow.model.Service;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.repository.ServiceRepository;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @GetMapping("/providers/pending")
    public ResponseEntity<?> getPendingProviders() {
        List<User> pending = userRepository.findByRoleAndIsVerified(User.Role.PROVIDER, false);
        return ResponseEntity.ok(pending);
    }

    @PatchMapping("/providers/{id}/verify")
    public ResponseEntity<?> verifyProvider(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        user.setIsVerified(true);
        userRepository.save(user);
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Provider verified");
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/providers/{id}/reject")
    public ResponseEntity<?> rejectProvider(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        user.setIsVerified(false);
        user.setVerificationRejectionReason(body.getOrDefault("reason", ""));
        userRepository.save(user);
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Provider rejected");
        return ResponseEntity.ok(resp);
    }

    // Get all users (customers, providers, admins)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findByIsDeletedFalse();
        return ResponseEntity.ok(users);
    }

    // Get all services
    @GetMapping("/services")
    public ResponseEntity<?> getAllServices() {
        List<Service> services = serviceRepository.findByIsDeletedFalse();
        return ResponseEntity.ok(services);
    }

    // Delete user (hard delete - permanently remove from database)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        
        // Hard delete - permanently remove from database
        userRepository.deleteById(id);
        
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "User deleted successfully");
        resp.put("userId", id.toString());
        return ResponseEntity.ok(resp);
    }

    // Delete service (hard delete - permanently remove from database)
    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        Service service = serviceRepository.findById(id).orElse(null);
        if (service == null) return ResponseEntity.notFound().build();
        
        // Hard delete - permanently remove from database
        serviceRepository.deleteById(id);
        
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Service deleted successfully");
        resp.put("serviceId", id.toString());
        return ResponseEntity.ok(resp);
    }

    // Get all users including deleted (for admin view)
    @GetMapping("/users/all")
    public ResponseEntity<?> getAllUsersIncludingDeleted() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Get all services including deleted (for admin view)
    @GetMapping("/services/all")
    public ResponseEntity<?> getAllServicesIncludingDeleted() {
        List<Service> services = serviceRepository.findAll();
        return ResponseEntity.ok(services);
    }
}

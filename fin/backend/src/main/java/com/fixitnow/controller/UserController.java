package com.fixitnow.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.model.User;
import com.fixitnow.repository.UserRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Get user profile by ID (public endpoint for chat feature)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error getting user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to fetch user profile");
        }
    }

    // Update user profile by ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            // Update user fields if provided
            if (updates.containsKey("name")) {
                user.setName((String) updates.get("name"));
            }
            if (updates.containsKey("email")) {
                user.setEmail((String) updates.get("email"));
            }
            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }
            if (updates.containsKey("location")) {
                user.setLocation((String) updates.get("location"));
            }
            if (updates.containsKey("avatarUrl") || updates.containsKey("profile_image")) {
                String avatarUrl = (String) updates.getOrDefault("avatarUrl", updates.get("profile_image"));
                user.setProfileImage(avatarUrl);
            }
            if (updates.containsKey("bio")) {
                user.setBio((String) updates.get("bio"));
            }
            if (updates.containsKey("experience")) {
                user.setExperience((String) updates.get("experience"));
            }
            if (updates.containsKey("serviceArea")) {
                user.setServiceArea((String) updates.get("serviceArea"));
            }

            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User profile updated successfully");
            response.put("user", user);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error updating user profile: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update user profile: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

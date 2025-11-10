package com.fixitnow.controller;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.dto.JwtResponse;
import com.fixitnow.dto.LoginRequest;
import com.fixitnow.dto.SignupRequest;
import com.fixitnow.model.User;
import com.fixitnow.model.PasswordResetToken;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.repository.PasswordResetTokenRepository;
import com.fixitnow.security.JwtUtils;
import com.fixitnow.security.UserPrincipal;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
                    
            // Block login for unverified providers
            if (user.getRole() == User.Role.PROVIDER && (user.getIsVerified() == null || !user.getIsVerified())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Admin Not Approved This profile yet Please Wait We'll Get Reach You Soon");
                return ResponseEntity.status(403).body(error);
            }

            String jwt = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name());
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("refreshToken", refreshToken);
            response.put("type", "Bearer");
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("location", user.getLocation());
            response.put("phone", user.getPhone());
            response.put("profileImage", user.getProfileImage());
            response.put("avatarUrl", user.getProfileImage());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid credentials");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        Map<String, String> response = new HashMap<>();
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            response.put("message", "Error: Email is already taken!");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Create new user account
            User user = new User(signUpRequest.getName(),
                               signUpRequest.getEmail(),
                               encoder.encode(signUpRequest.getPassword()),
                               User.Role.valueOf(signUpRequest.getRole().toUpperCase()));

            user.setLocation(signUpRequest.getLocation());
            user.setPhone(signUpRequest.getPhone());
            
            if ("PROVIDER".equals(signUpRequest.getRole().toUpperCase())) {
                user.setBio(signUpRequest.getBio());
                user.setExperience(signUpRequest.getExperience());
                user.setServiceArea(signUpRequest.getServiceArea());
                user.setDocumentType(signUpRequest.getDocumentType());
                user.setVerificationDocument(signUpRequest.getVerificationDocument());
                // Provider starts unverified - will be verified by admin
                user.setIsVerified(false);
            }

            userRepository.save(user);

            response.put("message", "User registered successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        
        if (refreshToken != null && jwtUtils.validateJwtToken(refreshToken)) {
            String email = jwtUtils.getEmailFromJwtToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                    
            String newAccessToken = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name());
            
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", refreshToken);
            
            return ResponseEntity.ok(response);
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid refresh token");
        return ResponseEntity.badRequest().body(error);
    }

    @PostMapping("/admin-register")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        Map<String, String> response = new HashMap<>();
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            response.put("message", "Error: Email is already taken!");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Create new admin account
            User admin = new User(signUpRequest.getName(),
                                signUpRequest.getEmail(),
                                encoder.encode(signUpRequest.getPassword()),
                                User.Role.ADMIN);

            admin.setLocation(signUpRequest.getLocation());
            admin.setPhone(signUpRequest.getPhone());
            // Admins are verified by default
            admin.setIsVerified(true);

            userRepository.save(admin);

            System.out.println("DEBUG: Admin registered successfully - Email: " + admin.getEmail() + ", ID: " + admin.getId());

            response.put("message", "Admin registered successfully!");
            response.put("userId", admin.getId().toString());
            response.put("email", admin.getEmail());
            response.put("role", "ADMIN");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR: Admin registration failed - " + e.getMessage());
            e.printStackTrace();
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Not authenticated");
                return ResponseEntity.status(401).body(error);
            }

            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("location", user.getLocation());
            response.put("phone", user.getPhone());
            response.put("profileImage", user.getProfileImage());
            response.put("avatarUrl", user.getProfileImage()); // Also include as avatarUrl for compatibility
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            // Generate unique token
            String token = UUID.randomUUID().toString();
            
            // Token expires in 24 hours
            LocalDateTime expiryTime = LocalDateTime.now().plusHours(24);

            // Delete any existing unused tokens for this user
            passwordResetTokenRepository.findByUserAndUsedFalse(user).ifPresent(
                existingToken -> passwordResetTokenRepository.delete(existingToken)
            );

            // Create and save new reset token
            PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryTime);
            passwordResetTokenRepository.save(resetToken);

            // In production, you would send this token via email
            System.out.println("DEBUG: Password reset token created for " + email + ": " + token);
            System.out.println("DEBUG: Token expires at: " + expiryTime);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset token sent to your email");
            response.put("token", token); // In production, don't return this; send via email only
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating password reset token: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String token = request.get("token");
            String newPassword = request.get("newPassword");

            // Validation
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (token == null || token.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Reset token is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "New password is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (newPassword.length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Password must be at least 6 characters");
                return ResponseEntity.badRequest().body(error);
            }

            // Find the reset token
            PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

            // Check if token is expired
            if (resetToken.isExpired()) {
                passwordResetTokenRepository.delete(resetToken);
                Map<String, String> error = new HashMap<>();
                error.put("message", "Reset token has expired");
                return ResponseEntity.badRequest().body(error);
            }

            // Check if token has already been used
            if (resetToken.getUsed()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Reset token has already been used");
                return ResponseEntity.badRequest().body(error);
            }

            // Verify email matches
            if (!resetToken.getUser().getEmail().equals(email)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email does not match reset token");
                return ResponseEntity.badRequest().body(error);
            }

            // Update user password
            User user = resetToken.getUser();
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);

            // Mark token as used
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);

            System.out.println("DEBUG: Password reset successful for user: " + email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully! You can now login with your new password.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
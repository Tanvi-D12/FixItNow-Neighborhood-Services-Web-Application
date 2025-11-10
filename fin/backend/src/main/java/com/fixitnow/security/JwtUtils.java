package com.fixitnow.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;
    
    @Value("${app.jwt.refresh-expiration}")
    private int refreshExpirationMs;
    
    public String generateJwtToken(String email, String role) {
        try {
            Algorithm algorithm = Algorithm.HMAC512(jwtSecret);
            return JWT.create()
                    .withSubject(email)
                    .withClaim("role", role)
                    .withIssuedAt(new Date())
                    .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpirationMs))
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Error creating JWT token", exception);
        }
    }
    
    public String generateRefreshToken(String email) {
        try {
            Algorithm algorithm = Algorithm.HMAC512(jwtSecret);
            return JWT.create()
                    .withSubject(email)
                    .withIssuedAt(new Date())
                    .withExpiresAt(new Date(System.currentTimeMillis() + refreshExpirationMs))
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Error creating refresh token", exception);
        }
    }
    
    public String getEmailFromJwtToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC512(jwtSecret);
            JWTVerifier verifier = JWT.require(algorithm).build();
            DecodedJWT decodedJWT = verifier.verify(token);
            return decodedJWT.getSubject();
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Error getting email from JWT token", exception);
        }
    }
    
    public String getRoleFromJwtToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC512(jwtSecret);
            JWTVerifier verifier = JWT.require(algorithm).build();
            DecodedJWT decodedJWT = verifier.verify(token);
            return decodedJWT.getClaim("role").asString();
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Error getting role from JWT token", exception);
        }
    }
    
    public boolean validateJwtToken(String authToken) {
        try {
            Algorithm algorithm = Algorithm.HMAC512(jwtSecret);
            JWTVerifier verifier = JWT.require(algorithm).build();
            verifier.verify(authToken);
            return true;
        } catch (JWTVerificationException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }
        return false;
    }
}
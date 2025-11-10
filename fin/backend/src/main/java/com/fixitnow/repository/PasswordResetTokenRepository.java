package com.fixitnow.repository;

import com.fixitnow.model.PasswordResetToken;
import com.fixitnow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUserAndUsedFalse(User user);
    void deleteByExpiryTimeBeforeAndUsedFalse(LocalDateTime expiryTime);
}

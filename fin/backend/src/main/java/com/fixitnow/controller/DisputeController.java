package com.fixitnow.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fixitnow.model.Booking;
import com.fixitnow.model.Dispute;
import com.fixitnow.model.User;
import com.fixitnow.repository.BookingRepository;
import com.fixitnow.repository.DisputeRepository;
import com.fixitnow.repository.UserRepository;

@RestController
public class DisputeController {

    @Autowired
    private DisputeRepository disputeRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // Customer reports a dispute for a booking
    @PostMapping("/disputes/report")
    public ResponseEntity<?> reportDispute(@RequestBody Map<String, String> body) {
        try {
            Long bookingId = Long.valueOf(body.get("bookingId"));
            Long reporterId = Long.valueOf(body.get("reporterId"));
            String description = body.get("description");

            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            User reporter = userRepository.findById(reporterId).orElse(null);
            if (booking == null || reporter == null) return ResponseEntity.badRequest().body(Map.of("message","Invalid booking or reporter"));

            Dispute d = new Dispute();
            d.setBooking(booking);
            d.setReporter(reporter);
            d.setDescription(description);
            disputeRepository.save(d);

            return ResponseEntity.ok(Map.of("message","Dispute reported"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message","Invalid request"));
        }
    }

    // Admin: list disputes (only OPEN disputes)
    @GetMapping("/admin/disputes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listDisputes() {
        List<Dispute> list = disputeRepository.findByStatus(Dispute.Status.OPEN);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/disputes/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveDispute(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Dispute d = disputeRepository.findById(id).orElse(null);
        if (d == null) return ResponseEntity.notFound().build();
        d.setStatus(Dispute.Status.RESOLVED);
        if (body.containsKey("refundAmount")) {
            try {
                BigDecimal amt = new BigDecimal(String.valueOf(body.get("refundAmount")));
                d.setRefundAmount(amt);
            } catch (Exception ignored) {}
        }
        d.setAdminNote((String) body.getOrDefault("adminNote", ""));
        d.setResolvedAt(LocalDateTime.now());
        disputeRepository.save(d);
        return ResponseEntity.ok(Map.of("message","Dispute resolved"));
    }

    @PostMapping("/admin/disputes/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectDispute(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Dispute d = disputeRepository.findById(id).orElse(null);
        if (d == null) return ResponseEntity.notFound().build();
        d.setStatus(Dispute.Status.REJECTED);
        d.setAdminNote(body.getOrDefault("adminNote", ""));
        d.setResolvedAt(LocalDateTime.now());
        disputeRepository.save(d);
        return ResponseEntity.ok(Map.of("message","Dispute rejected"));
    }
}

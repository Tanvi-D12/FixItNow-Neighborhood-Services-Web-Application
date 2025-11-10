# Admin Panel Guide - FixItNow v2.0

## 🆕 What's New in v2.0

### Provider Verification with Document Upload
Providers must now submit business documents during registration for admin verification:
- **Radio Button Selection**: Choose document type (ShopAct, MSME Certificate, Udyam)
- **Mandatory File Upload**: Upload business document (PDF, JPG, PNG - max 5MB)
- **Document Review**: Admin can view uploaded documents in modal before approval
- **Login Block**: Unverified providers receive message: **"Admin Not Approved This profile yet Please Wait We'll Get Reach You Soon"**

### Dispute Management Fixes
- Fixed issue where resolved disputes reappeared after refresh
- Backend now filters `/admin/disputes` to show only OPEN disputes
- Disputes automatically removed from view after marking as addressed

---

## ✅ Features Implemented

### 1. Provider Verification Workflow with Document Upload
**Backend Endpoints:**
- `GET /api/admin/providers/pending` — List all unverified providers with document details
- `PATCH /api/admin/providers/{id}/verify` — Approve a provider (sets `isVerified = true`)
- `PATCH /api/admin/providers/{id}/reject` — Reject a provider with reason

**How it works:**
1. Provider registers at `/register` with role PROVIDER
2. Provider must:
   - Select document type via radio button (ShopAct, MSME Certificate, or Udyam)
   - Upload business document (file input - PDF, JPG, PNG)
3. Provider is created with `isVerified = false` (cannot login)
4. Admin navigates to `/admin/providers` page
5. Admin reviews provider details and can view uploaded document
6. Admin approves or rejects provider
7. Once approved, provider can login

**Login Protection:**
- Modified `AuthController.authenticateUser()` to block providers unless `isVerified == true`
- Error message: **"Admin Not Approved This profile yet Please Wait We'll Get Reach You Soon"**
- HTTP Status: 403 Forbidden

---

### 2. Dispute Resolution Workflow (Customer & Provider)
**Backend Endpoints:**
- `POST /api/disputes/report` — Customer OR Provider reports a dispute for a booking
- `GET /api/admin/disputes` — Admin lists all OPEN disputes only (fixed reappearing issue)
- `POST /api/admin/disputes/{id}/resolve` — Resolve dispute (mark as RESOLVED)
- `POST /api/admin/disputes/{id}/reject` — Reject dispute

**How it works:**
1. Customer OR Provider files a dispute via `/bookings` "Report Issue" button
   - Form auto-fills reporter details and other party name
   - Reporter enters issue details
2. Admin navigates to `/admin/disputes` page
3. Admin reviews OPEN disputes only:
   - See dispute details (booking ID, reporter, description, date)
   - Click "✓ Addressed" button (one-click resolution)
4. Dispute status updated to RESOLVED
   - Admin note set to "Addressed by admin"
   - Resolved timestamp recorded
5. On page refresh: Only OPEN disputes shown (resolved disputes filtered out)

---

## 🎯 Frontend Routes

### Admin Pages
- `/admin/providers` → **AdminProviders.js** — Verify/reject providers
- `/admin/disputes` → **AdminDisputes.js** — Resolve disputes

### How to Access
1. Create an ADMIN user in the database (manually for now):
   ```sql
   INSERT INTO users (name, email, password, role, is_active, is_verified, created_at)
   VALUES ('Admin User', 'admin@fixitnow.com', 'hashed_password', 'ADMIN', TRUE, TRUE, NOW());
   ```
2. Login as admin at `/login` 
3. Navigate to `/admin/providers` or `/admin/disputes`

---

## 📁 Key Files Modified

### Backend
- **Model:** 
  - `backend/src/main/java/com/fixitnow/model/User.java` — Added `documentType` field
  - `backend/src/main/java/com/fixitnow/model/Dispute.java` — Disputes table
- **DTO:** 
  - `backend/src/main/java/com/fixitnow/dto/SignupRequest.java` — Added `documentType` and `verificationDocument` fields
- **Controllers:** 
  - `AuthController.java` — Updated signin error message, signup saves document fields
  - `AdminController.java` — Provider verification endpoints
  - `DisputeController.java` — Fixed `/admin/disputes` to filter by status=OPEN
- **Migrations:**
  - `V6__add_verification_and_dispute.sql` — Added verification columns and disputes table
  - `V7__add_document_type.sql` — Added document_type column to users table

### Frontend
- **Pages:**
  - `frontend/src/pages/Register.js` — Added document type radio buttons and file upload
  - `frontend/src/pages/AdminProviders.js` — Added document viewer modal
  - `frontend/src/pages/AdminDisputes.js` — Fixed reappearing disputes issue
- **Routes:** `frontend/src/App.js` — Admin routes with LayoutWrapper

---

## 🚀 Quick Test Commands

### 1. List pending providers (requires admin token)
```bash
curl -X GET http://localhost:8080/api/admin/providers/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Verify a provider
```bash
curl -X PATCH http://localhost:8080/api/admin/providers/2/verify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Report a dispute
```bash
curl -X POST http://localhost:8080/api/disputes/report \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "reporterId": 3,
    "description": "Service not provided as agreed"
  }'
```

### 4. Resolve a dispute
```bash
curl -X POST http://localhost:8080/api/admin/disputes/1/resolve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "refundAmount": 500.00,
    "adminNote": "Refund approved for poor service"
  }'
```

---

## 📋 Database Schema

### users table updates (V7)
```sql
ALTER TABLE users ADD COLUMN document_type VARCHAR(50);
-- document_type values: 'ShopAct', 'MSME Certificate', 'Udyam'
```

### users table updates (V6)
```sql
ALTER TABLE users ADD COLUMN verification_document VARCHAR(255);
ALTER TABLE users ADD COLUMN verification_rejection_reason TEXT;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
```

### disputes table (V6)
```sql
CREATE TABLE disputes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  reporter_id BIGINT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, RESOLVED, REJECTED
  refund_amount DECIMAL(10,2),
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  CONSTRAINT fk_dispute_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_dispute_reporter FOREIGN KEY (reporter_id) REFERENCES users(id)
);
```

---

## ✨ Next Steps (Optional Enhancements)

1. **Email Notifications** — Notify provider when approved/rejected
2. **Document Upload** — Allow providers to upload verification docs during registration
3. **Payment Integration** — Integrate Stripe/PayPal for automated refunds
4. **Admin Dashboard** — Add statistics (total disputes, verification rate, etc.)
5. **Audit Log** — Track all admin actions for compliance

---

## 🔒 Security Notes

- All admin endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`
- Provider login blocked in `AuthController` if not verified
- CORS configured for `http://localhost:3000`
- JWT tokens required for all protected endpoints

---

## ❓ Troubleshooting

**Q: Provider can't login after registration?**
- A: Admin must verify them first at `/admin/providers`

**Q: Dispute endpoint returns 401?**
- A: Need valid JWT token in `Authorization: Bearer TOKEN` header

**Q: Admin page shows blank?**
- A: Backend must be running on port 8080, ensure `REACT_APP_API_URL=http://localhost:8080/api` in frontend `.env`

---

**Status:** ✅ Ready to use! Backend admin panel is fully functional.

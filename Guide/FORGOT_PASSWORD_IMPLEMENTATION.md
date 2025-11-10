# Forgot Password Feature Implementation

## Overview
This document outlines the implementation of the "Forgot Password" feature for the FixItNow application. The feature allows users and providers to securely reset their passwords if forgotten.

## Frontend Changes

### 1. Login Page (`src/pages/Login.js`)
- Added "Forgot password?" link above the Sign In button
- Link redirects to `/forgot-password` route
- Styling consistent with existing form design

### 2. New Pages Created

#### ForgotPassword Page (`src/pages/ForgotPassword.js`)
- **Path:** `/forgot-password`
- **Purpose:** Allows users to request a password reset
- **Fields:**
  - Email address (required)
- **Features:**
  - Email validation
  - Loading state during submission
  - Success message display
  - Auto-redirect to reset password page after 2 seconds
- **Endpoint:** `POST /auth/forgot-password`

#### ResetPassword Page (`src/pages/ResetPassword.js`)
- **Path:** `/reset-password`
- **Purpose:** Allows users to set a new password using a reset token
- **Fields:**
  - Email address (required)
  - Reset Token (required) - sent via email
  - New Password (required, min 6 characters)
  - Confirm Password (required, must match)
- **Features:**
  - Password visibility toggle
  - Confirm password visibility toggle
  - Email pre-filled if coming from ForgotPassword page
  - Password validation (length, matching)
  - Loading state during submission
  - Redirect to login page after successful reset
- **Endpoint:** `POST /auth/reset-password`

### 3. App Routes (`src/App.js`)
Added two new routes:
```javascript
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

## Backend Changes

### 1. New Model: PasswordResetToken
**File:** `src/main/java/com/fixitnow/model/PasswordResetToken.java`

**Fields:**
- `id`: Primary key
- `token`: Unique reset token (UUID format)
- `user`: Foreign key to User entity
- `expiryTime`: Token expiration time (24 hours from creation)
- `used`: Boolean flag to track if token has been used
- `createdAt`: Timestamp of creation

**Methods:**
- `isExpired()`: Checks if token has expired

### 2. Repository: PasswordResetTokenRepository
**File:** `src/main/java/com/fixitnow/repository/PasswordResetTokenRepository.java`

**Methods:**
- `findByToken(String token)`: Find token by token string
- `findByUserAndUsedFalse(User user)`: Find unused tokens for a user
- `deleteByExpiryTimeBeforeAndUsedFalse(LocalDateTime)`: Clean up expired tokens

### 3. AuthController Endpoints

#### Endpoint 1: POST /auth/forgot-password
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "Password reset token sent to your email",
  "token": "unique-token-uuid"
}
```

**Response (Error):**
```json
{
  "message": "Error: User not found with email: ..."
}
```

**Logic:**
1. Validate email is provided
2. Find user by email
3. Generate unique UUID token
4. Set token expiration to 24 hours from now
5. Delete any existing unused tokens for this user
6. Save new reset token to database
7. **Note:** In production, token should be sent via email, not returned in response
8. **Current Implementation:** Token is returned for development/testing purposes

#### Endpoint 2: POST /auth/reset-password
**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "unique-token-uuid",
  "newPassword": "newPassword123"
}
```

**Response (Success):**
```json
{
  "message": "Password reset successfully! You can now login with your new password."
}
```

**Response (Error):**
```json
{
  "message": "Error: Invalid or expired reset token" / "Email does not match" / etc.
}
```

**Logic:**
1. Validate all required fields (email, token, newPassword)
2. Validate password length (min 6 characters)
3. Find reset token by token string
4. Validate token is not expired
5. Validate token has not already been used
6. Validate email matches token owner
7. Hash new password using BCrypt
8. Update user password in database
9. Mark token as used
10. Return success message

## Security Features

1. **Token Expiration:** Tokens expire after 24 hours
2. **Token Uniqueness:** Each reset uses a unique UUID-based token
3. **Single-Use Tokens:** Tokens can only be used once
4. **Password Hashing:** New passwords are hashed using BCrypt
5. **Email Verification:** Email must match the token owner
6. **Input Validation:** All inputs are validated on both frontend and backend

## Flow Diagram

```
User clicks "Forgot password?" on Login page
                    ↓
Redirected to /forgot-password
                    ↓
Enters email and submits
                    ↓
POST /auth/forgot-password → Backend generates token
                    ↓
Success message displayed
Auto-redirect to /reset-password (email pre-filled)
                    ↓
User enters reset token (from email), new password
                    ↓
POST /auth/reset-password → Backend validates and resets password
                    ↓
Success message displayed
Auto-redirect to /login page
                    ↓
User logs in with new password
```

## Database Changes

New table `password_reset_tokens` created with fields:
- `id` (BIGINT, PRIMARY KEY)
- `token` (VARCHAR, UNIQUE)
- `user_id` (BIGINT, FOREIGN KEY)
- `expiry_time` (DATETIME)
- `used` (BOOLEAN)
- `created_at` (DATETIME)

## Testing

### Test Case 1: Forgot Password
1. Navigate to `/login`
2. Click "Forgot password?"
3. Enter valid email
4. Verify success message and token in browser console (development only)
5. Verify redirected to `/reset-password`
6. Verify email field is pre-filled

### Test Case 2: Reset Password
1. From `/reset-password`, enter:
   - Email (from previous page)
   - Token (from console log or email in production)
   - New password (min 6 chars)
   - Confirm password (must match)
2. Click "Reset Password"
3. Verify success message
4. Verify redirected to `/login`
5. Login with new password
6. Verify login successful

### Test Case 3: Error Handling
- Invalid email → "User not found" error
- Expired token → "Reset token has expired" error
- Wrong email for token → "Email does not match" error
- Mismatched passwords → "Passwords do not match" error
- Short password → "Password must be at least 6 characters" error

## Production Deployment Notes

1. **Email Integration:** Add email service (SendGrid, AWS SES, etc.) to send reset tokens via email
   - Update `forgot-password` endpoint to send email instead of returning token
   
2. **Frontend Update:** Remove token from response once email is implemented
   - Frontend won't need to display token input field
   - Token will be passed via email link with embedded token

3. **Security:** 
   - Implement rate limiting on password reset requests
   - Add CAPTCHA to prevent brute force attempts
   - Consider SMS delivery for sensitive operations

4. **Token Delivery Method:** Consider using magic links
   - Instead of token input, user can click link in email
   - Link automatically includes token: `https://app.com/reset-password?token=xyz&email=user@example.com`

## Possible Future Enhancements

1. **Email-Based Magic Links:** Send clickable links instead of manual token entry
2. **Multi-Factor Authentication:** Add SMS or TOTP verification
3. **Password Strength Requirements:** Enforce stronger password requirements
4. **Password Change Email Notification:** Notify user when password is changed
5. **Account Recovery Questions:** Add security questions as additional verification
6. **Session Invalidation:** Invalidate all active sessions after password reset

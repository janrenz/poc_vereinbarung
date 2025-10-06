# Authentication & User Management

This document describes the authentication system implementation for the Zielvereinbarung Digital platform.

## Overview

The platform uses a secure, token-based authentication system with the following features:

- **User Registration** with email verification
- **Password Reset** with single-use tokens
- **Session Management** with crypto-based tokens
- **Rate Limiting** on all authentication endpoints
- **Audit Logging** for GDPR compliance
- **User Enumeration Protection**

## User Types

### 1. Schulaufsicht Users (Authenticated)
- Require account registration and login
- Can create and manage forms for schools
- Access admin dashboard
- Receive notifications

### 2. Schools (Anonymous)
- Do NOT require accounts
- Access forms via unique access codes
- Edit forms directly without authentication
- Submit forms when complete

## Registration Flow

### User Registration
**Endpoint:** `POST /api/auth/register`

**Process:**
1. User provides: name, schulaufsichtName, email, password
2. System validates input with Zod schema
3. Password hashed with bcrypt (12 rounds)
4. User created with `active: false, emailVerified: false`
5. 24-hour verification token generated
6. Verification email sent with link
7. User account remains inactive until email verified

**Security Features:**
- Rate limiting: 3 registrations per hour per IP
- Duplicate email detection (409 Conflict)
- Password complexity requirements:
  - Minimum 12 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- Comprehensive audit logging

### Email Verification
**Endpoint:** `GET /api/auth/verify-email?token={token}`

**Process:**
1. User clicks verification link from email
2. System validates token:
   - Token exists in database
   - Token not expired (24 hours)
   - Token not already used
3. User account activated: `emailVerified: true, active: true`
4. Token marked as used
5. User redirected to login page

**Security Features:**
- Single-use tokens
- 24-hour expiration
- Token invalidated after use
- Clear error messages for expired/invalid tokens

## Login Flow

**Endpoint:** `POST /api/auth/login`

**Process:**
1. User provides email and password
2. System validates credentials
3. Account lockout after 5 failed attempts (30 minutes)
4. Session token created (30 days validity)
5. User redirected to admin dashboard

**Security Features:**
- Rate limiting: 5 attempts per minute per IP
- Timing attack protection (constant-time comparison)
- Account lockout mechanism
- Failed attempt tracking
- Audit logging for all login attempts

## Password Reset Flow

### Request Reset
**Endpoint:** `POST /api/auth/forgot-password`

**Process:**
1. User provides email address
2. System finds user by email
3. If user exists and active:
   - Generate reset token (1 hour validity)
   - Send password reset email
4. Always return success (user enumeration protection)

**Security Features:**
- Rate limiting: 3 requests per minute per IP
- User enumeration protection
- 1-hour token expiration
- Single-use tokens

### Reset Password
**Endpoint:** `POST /api/auth/reset-password`

**Process:**
1. User provides token and new password
2. System validates token:
   - Token exists
   - Not expired
   - Not already used
3. Password hashed with bcrypt
4. User password updated
5. All existing sessions invalidated (force re-login)
6. Token marked as used

**Security Features:**
- Rate limiting: 5 requests per minute per IP
- Password complexity validation
- Token single-use enforcement
- Session invalidation after password change
- Audit logging

## Session Management

### Session Token Generation
- Uses `crypto.randomBytes(32)` for secure random tokens
- Tokens stored hashed in database
- Default expiration: 30 days
- Extended on activity (updated `lastActivityAt`)

### Session Validation
- Middleware checks token validity on protected routes
- Validates:
  - Token exists in database
  - Token not expired
  - User account active
  - User email verified

### Session Cleanup
Sessions automatically expire after 30 days or when:
- User logs out explicitly
- User password is changed
- Account is deactivated

## Email Integration

### Email Service: Resend
**Implementation:** Direct REST API calls (not SDK to avoid peer dependencies)

**Configuration:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SCHULAUFSICHT_EMAIL=schulaufsicht@yourdomain.com
```

### Email Templates

#### 1. Email Verification
- Subject: "E-Mail-Adresse bestätigen"
- Contains verification link with 24h token
- Includes welcome message

#### 2. Password Reset
- Subject: "Passwort zurücksetzen"
- Contains reset link with 1h token
- Security notice about unsolicited requests

#### 3. Form Submitted (to schulaufsicht)
- Subject: "Neue Zielvereinbarung eingereicht"
- School name and form details
- Link to admin dashboard

### Development Mode
When `RESEND_API_KEY` is not set:
- Emails logged to console only
- Full email content displayed
- Useful for local development

## Rate Limiting

All authentication endpoints have rate limiting:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/register` | 3 requests | 1 hour |
| `/api/auth/login` | 5 requests | 1 minute |
| `/api/auth/forgot-password` | 3 requests | 1 minute |
| `/api/auth/reset-password` | 5 requests | 1 minute |

**Implementation:**
- In-memory rate limit store
- IP-based tracking
- Automatic cleanup of old entries
- Clear error messages when limit exceeded

## Audit Logging

All authentication events are logged to `AuditLog` table:

### Logged Events:
- `USER_CREATED` - Registration
- `USER_UPDATED` - Email verification, password change
- `LOGIN_SUCCESS` - Successful login
- `LOGIN_FAILED` - Failed login attempt
- `LOGOUT` - User logout
- `PASSWORD_RESET_REQUESTED` - Forgot password
- `PASSWORD_RESET_COMPLETED` - Password changed

### Audit Log Fields:
```typescript
{
  action: string;          // Event type
  userId?: string;         // User ID if known
  userEmail?: string;      // User email
  ipAddress?: string;      // Request IP
  userAgent?: string;      // Browser/client
  success: boolean;        // Success/failure
  errorMessage?: string;   // Error if failed
  metadata?: Json;         // Additional context
  createdAt: DateTime;     // Timestamp
}
```

### GDPR Compliance:
- Audit logs retained for 90 days
- Automatic cleanup via cron job
- User data export endpoint available

## Security Best Practices

### 1. Password Security
- Minimum 12 characters
- Complexity requirements enforced
- Bcrypt hashing with 12 rounds
- No password history (planned)

### 2. Token Security
- Cryptographically secure random tokens
- Single-use tokens for sensitive operations
- Short expiration times
- Tokens hashed in database

### 3. Input Validation
- Zod schemas for all inputs
- Email format validation
- SQL injection protection (Prisma parameterized queries)
- XSS prevention (React automatic escaping)

### 4. Account Security
- Email verification required
- Account lockout after failed attempts
- Session invalidation on password change
- Active flag for account deactivation

### 5. API Security
- Rate limiting on all auth endpoints
- User enumeration protection
- Timing attack protection
- HTTPS required in production

### 6. Privacy & GDPR
- Audit logging for accountability
- Data retention policies
- User data export capability
- Clear privacy policy

## Error Handling

### User-Facing Error Messages
- Generic messages to prevent information leakage
- "Ungültige Anmeldedaten" instead of "User not found"
- "Link gesendet" instead of revealing if email exists

### Audit Log Error Messages
- Detailed technical errors logged
- Stack traces in development
- Sanitized in production
- Never exposed to users

## Testing

### E2E Test Coverage (40+ tests)

**Registration Tests:**
- Field validation
- Password confirmation
- Duplicate email detection
- Rate limiting
- Security (SQL injection, XSS)
- User enumeration protection

**Password Reset Tests:**
- Request flow
- Token validation
- Token expiry
- Token reuse prevention
- Rate limiting
- Integration flow

**Email Verification Tests:**
- Token validation
- Expiry handling
- Error states
- Loading states

### Test Files:
- `e2e/registration.spec.ts` - 20+ registration tests
- `e2e/password-reset.spec.ts` - 20+ password reset tests
- `e2e/login.spec.ts` - Login flow tests
- `e2e/authorization.spec.ts` - Auth middleware tests

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Bcrypt hashed
  role      UserRole @default(ADMIN)

  name          String?
  schulaufsichtName  String?   // Organization name
  active        Boolean   @default(true)
  emailVerified Boolean   @default(false)

  lastLoginAt DateTime?
  failedLoginAttempts Int @default(0)
  lockedUntil DateTime?

  forms     Form[]
  sessions  Session[]
}
```

### EmailVerificationToken Model
```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?

  @@index([email])
  @@index([token])
}
```

### PasswordResetToken Model
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?

  @@index([email])
  @@index([token])
}
```

### Session Model
```prisma
model Session {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  token          String   @unique
  expiresAt      DateTime
  lastActivityAt DateTime @default(now())
  ipAddress      String?
  userAgent      String?

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

## API Endpoints

### Public Endpoints (No Auth Required)
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/validate-reset-token` - Check token validity
- `POST /api/auth/reset-password` - Reset password

### Protected Endpoints (Auth Required)
- `POST /api/auth/logout` - User logout
- `GET /api/users/[id]/export` - Export user data
- All `/api/forms/*` endpoints
- All `/api/entries/*` endpoints
- All `/admin/*` pages

## Deployment Considerations

### Environment Variables
Required for production:
```env
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SCHULAUFSICHT_EMAIL=schulaufsicht@yourdomain.com
```

### Database Migration
Before deployment, run:
```bash
npx prisma migrate deploy
```

This creates:
- `emailVerified` field on User
- `schulaufsichtName` field on User
- `EmailVerificationToken` table

### Security Headers
Ensure Next.js middleware sets:
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`

### Monitoring
Monitor for:
- Failed login attempts
- Rate limit violations
- Token expiration errors
- Email delivery failures
- Audit log volume

## Future Improvements

### Planned
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Microsoft)
- [ ] Password history (prevent reuse)
- [ ] More granular permissions
- [ ] Account recovery via security questions
- [ ] Email notification preferences
- [ ] Session management UI (view/revoke active sessions)

### Under Consideration
- [ ] Magic link login
- [ ] Remember me functionality
- [ ] Device fingerprinting
- [ ] Suspicious activity detection
- [ ] CAPTCHA for repeated failures
- [ ] WebAuthn/Passkeys support

## Support

For security concerns or questions, contact:
- Security issues: Create private GitHub issue
- General questions: See README.md
- GDPR requests: Use data export endpoint

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [GDPR Compliance](https://gdpr.eu/)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

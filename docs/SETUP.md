# Development Setup Guide

This guide will help you set up the Zielvereinbarung Digital application for local development.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 14.x or higher (or use SQLite for development)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zielvereinbarung-digital
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zielvereinbarung"
# For PostgreSQL connection pooling (Vercel/Production)
DATABASE_URL_UNPOOLED="postgresql://user:password@localhost:5432/zielvereinbarung"

# Alternative: SQLite for local development
# DATABASE_URL="file:./dev.db"
# DATABASE_URL_UNPOOLED="file:./dev.db"

# Email (optional for development)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
FROM_EMAIL="noreply@yourdomain.com"
SCHULAUFSICHT_EMAIL="schulaufsicht@example.com"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Database Setup

#### Option A: PostgreSQL (Recommended for Production-like Environment)

```bash
# Create database
createdb zielvereinbarung

# Run migrations
npx prisma migrate dev

# Seed database with demo data
npx prisma db seed
```

#### Option B: SQLite (Quick Development)

```bash
# Migrations and seed
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After seeding, you can use these demo credentials:

### Schulaufsicht Admin
- **Email:** schulaufsicht@example.com
- **Password:** schulaufsicht123

### Test Forms
The seed creates sample forms for schools with access codes like:
- `ABC-123-DEF`
- `XYZ-789-GHI`

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma studio           # Open Prisma Studio (database GUI)
npx prisma migrate dev      # Create and apply migrations
npx prisma migrate reset    # Reset database and reseed
npx prisma db seed          # Seed database with demo data
npx prisma generate         # Generate Prisma Client
```

### Testing
```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Run E2E tests with UI
npm run test:e2e:debug      # Debug E2E tests
npm run test:e2e -- <file>  # Run specific test file
```

## Project Structure

```
zielvereinbarung-digital/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── forms/          # Form management
│   │   │   ├── entries/        # Entry CRUD
│   │   │   └── schools/        # School search
│   │   ├── admin/              # Admin dashboard (protected)
│   │   ├── formular/           # Form access by code
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── forgot-password/    # Password reset request
│   │   ├── reset-password/     # Password reset
│   │   └── verify-email/       # Email verification
│   ├── components/             # React components
│   ├── lib/                    # Utilities and helpers
│   │   ├── prisma.ts           # Prisma client
│   │   ├── auth.ts             # Auth utilities
│   │   ├── email.ts            # Email service
│   │   ├── validation.ts       # Zod schemas
│   │   ├── rate-limit.ts       # Rate limiting
│   │   └── audit.ts            # Audit logging
│   └── middleware.ts           # Auth middleware
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script
│   └── migrations/             # Database migrations
├── e2e/                        # E2E tests (Playwright)
├── docs/                       # Documentation
└── public/                     # Static assets
```

## Key Features

### 1. Authentication System
- User registration with email verification
- Password reset with secure tokens
- Session-based authentication
- Rate limiting on all auth endpoints
- Audit logging for GDPR compliance

See [AUTHENTICATION.md](./AUTHENTICATION.md) for details.

### 2. Form Management
- Create forms for schools
- Generate unique access codes
- Form status workflow: DRAFT → SUBMITTED → APPROVED/RETURNED
- PDF export functionality
- Gantt chart visualization

### 3. School Integration
- JedeSchule API for school search
- School number verification
- Anonymous form access via codes

### 4. Admin Dashboard
- Form overview and management
- User management (planned)
- Notification system
- Audit log viewer (planned)

## Email Configuration

### Development Mode
Without `RESEND_API_KEY`, emails are logged to console:
```bash
=== EMAIL (Development Mode) ===
To: user@example.com
Subject: E-Mail-Adresse bestätigen
Body: [HTML content]
================================
```

### Production with Resend
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to `.env`:
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   FROM_EMAIL="noreply@yourdomain.com"
   ```

## Database Administration

### Prisma Studio
Visual database browser:
```bash
npx prisma studio
```

### Common Database Tasks

#### Reset and Reseed Database
```bash
npx prisma migrate reset
```

#### Create Migration
```bash
npx prisma migrate dev --name add_new_field
```

#### Deploy Migrations (Production)
```bash
npx prisma migrate deploy
```

## Testing

### E2E Tests with Playwright

#### Run All Tests
```bash
npm run test:e2e
```

#### Run Specific Test File
```bash
npm run test:e2e -- e2e/registration.spec.ts
```

#### Run with UI (Interactive)
```bash
npm run test:e2e:ui
```

#### Debug Tests
```bash
npm run test:e2e:debug
```

### Test Coverage
- 40+ authentication flow tests
- Form CRUD operations
- Entry management
- Autosave functionality
- Admin workflows
- Accessibility tests
- Security tests

## Common Issues

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Or use SQLite for development
# Update DATABASE_URL in .env to: file:./dev.db
```

### Prisma Client Out of Sync
```bash
npx prisma generate
```

### Migration Conflicts
```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Or resolve conflicts manually in prisma/migrations/
```

## Security Considerations

### Development
- Never commit `.env` file
- Use demo credentials only locally
- SQLite suitable for local development
- HTTPS not required locally

### Production
- Use PostgreSQL (not SQLite)
- Set strong `DATABASE_URL` credentials
- Enable HTTPS (enforced by middleware)
- Set proper `NEXT_PUBLIC_APP_URL`
- Configure email service
- Enable audit log cleanup cron job
- Review security headers in middleware

## Performance Tips

### Development
- Use `npm run dev -- --turbopack` for faster builds
- Enable Prisma query logging:
  ```typescript
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  ```

### Production
- Build with `npm run build`
- Use connection pooling (`DATABASE_URL_UNPOOLED`)
- Enable Prisma query caching
- Configure proper database indexes

## Useful Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Playwright Docs](https://playwright.dev)
- [Material Design 3](https://m3.material.io)

### Project Documentation
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Auth system details
- [TODO.md](../TODO.md) - Project roadmap
- [SECURITY_IMPLEMENTATION_STATUS.md](./SECURITY_IMPLEMENTATION_STATUS.md) - Security audit

## Getting Help

### Issues
- Check existing issues on GitHub
- Create new issue with reproduction steps
- Include environment details (OS, Node version, etc.)

### Pull Requests
- Follow existing code style
- Add E2E tests for new features
- Update documentation
- Run linter before submitting

## License

[Add license information]

## Contributors

[Add contributor information]

---

**Happy Coding! 🚀**

For questions or support, see the main [README.md](../README.md).

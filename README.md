# Zielvereinbarung Digital

Moderne, intuitive Plattform für digitale Zielvereinbarungen zwischen Schulen und Schulämtern.

## Features

- ✅ **Schulamt-Bereich**: Schulen suchen (JedeSchule API), Formulare anlegen und verwalten
- ✅ **Schulen-Bereich**: Formulare über Zugangscode öffnen und ausfüllen  
- ✅ **Material Design 3**: Moderne UI mit Animationen
- ✅ **Authentication**: Cookie-basierte Authentifizierung für Schulamt
- ✅ **Database**: SQLite (lokal) / PostgreSQL (Vercel Production) mit Prisma ORM
- ✅ **E2E Tests**: Playwright tests (21/27 passing)

## Setup

### Lokale Entwicklung (mit SQLite)

```bash
# Install dependencies
npm install

# Setup database (SQLite - kein Docker nötig!)
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

**Hinweis:** Lokale Entwicklung nutzt SQLite für einfaches Setup. Für Production wird PostgreSQL auf Vercel verwendet.

### Production Deployment auf Vercel

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Anweisungen zum Deployment auf Vercel mit Vercel Postgres.

## Email Configuration

The application uses [Resend](https://resend.com) for sending emails. Email functionality is optional - without configuration, emails will be logged to the console in development mode.

### Setting up Resend

1. Create a free account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to your `.env` file:

```bash
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com  # or use onboarding@resend.dev for testing
SCHULAMT_EMAIL=admin@schulamt.example.com  # Email for form submission notifications
```

### Email Features

The application sends emails for:
- **Password Reset**: When users request to reset their password
- **Form Submitted**: Notifies Schulamt when a school submits a form
- **Form Approved**: Notifies school when their form is approved
- **Form Returned**: Notifies school when their form needs revisions

**Development Mode**: Without `RESEND_API_KEY`, all emails are logged to console for testing.

## User Management

### Creating the First Superadmin

After setting up the database, create the first superadmin user:

```bash
npx tsx prisma/create-superadmin.ts
```

**Default Credentials:**
- Email: `superadmin@schulamt.nrw`
- Password: `Change-Me-123!`

⚠️ **WICHTIG:** Change this password immediately after first login or dont seed on prod!

### Access Levels

- **SUPERADMIN**: only user management
- **ADMIN**: Form management, no user management

### Creating Additional Users

1. Login as Superadmin
2. Navigate to "Benutzerverwaltung" (visible only to Superadmins)
3. Create new Admin or Superadmin accounts

## Demo Login Credentials

### Admin/Superadmin Login

After running `npm run dev`, you can login with these demo accounts:

**Admin Account** (Form management only):
- Email: `admin@schulamt.nrw`
- Password: `admin123`
- Access: Form management, notifications, no user management

**Superadmin Account** (Full access):
- Email: `superadmin@schulamt.nrw`
- Password: `superadmin123`
- Access: Form management + user management

Login at: http://localhost:3000/login

**Forgot Password?** Use the "Passwort vergessen?" link on the login page to request a password reset email.

### School Access Codes

**Test Access Codes** (from seed data):
- `TEST1234` - Gesamtschule Musterstadt (DRAFT) - Schulnummer: 123456
- `GYMN5678` - Gymnasium Beispielstadt (SUBMITTED) - Schulnummer: 654321
- `REAL9999` - Realschule am Park (APPROVED) - Schulnummer: 789012

Use these codes at: http://localhost:3000/formular

For completed forms (SUBMITTED/APPROVED), use:
- http://localhost:3000/completed
- Enter both school number AND access code

## Usage

### For Schulämter (School Authorities):

1. Navigate to http://localhost:3000/login
2. Login with demo credentials
3. Search for schools using the JedeSchule API
4. Create forms and generate access codes
5. Review and approve submitted forms

### For Schulen (Schools):

1. Navigate to http://localhost:3000/formular
2. Enter the access code provided by Schulamt
3. Fill out the Zielvereinbarung form
4. Save and submit

## Testing

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Material Design 3
- **Database**: SQLite (dev) / PostgreSQL (prod) + Prisma
- **Authentication**: Cookie-based with Bcrypt password hashing
- **User Management**: Role-based (SUPERADMIN, ADMIN)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Playwright
- **Email**: Resend API
- **External API**: JedeSchule API for school search

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── admin/        # Protected admin area
│   │   │   ├── users/    # User management (Superadmin only)
│   │   │   └── forms/    # Form management
│   │   ├── formular/     # Public form access
│   │   ├── login/        # Login page
│   │   └── api/          # API routes
│   └── lib/              # Utility functions
├── prisma/               # Database schema & migrations
│   ├── create-superadmin.ts # Script to create first superadmin
│   └── seed.ts          # Seed data
└── e2e/                  # Playwright E2E tests
```

## Development Notes

### Browser Cache Issues

If you experience login issues:

1. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear cookies**: Open DevTools → Application → Cookies → Delete all
3. **Clear cache**: DevTools → Network → Disable cache (checkbox)
4. **Restart dev server**: `pkill -f "next dev" && npm run dev`

### Database Reset

```bash
# Reset database
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

## API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/schools?q=<search>` - Search schools (JedeSchule)
- `POST /api/forms` - Create new form
- `GET /api/forms/[id]` - Get form details
- `POST /api/forms/[id]/approve` - Approve form
- `POST /api/forms/[id]/return` - Return for revision
- `GET /api/forms/[id]/export` - Export form data

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-secret-key-here"
```

## License

Private project for educational purposes.

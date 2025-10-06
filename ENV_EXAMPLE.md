# Environment Variables

Copy this to `.env.local` for local development:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"
# For Vercel PostgreSQL, use:
# DATABASE_URL="postgresql://..."
# DIRECT_URL="postgresql://..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (optional - if not set, emails will be logged to console)
RESEND_API_KEY=""
FROM_EMAIL="noreply@zielvereinbarung.digital"

# Schulaufsicht Email for notifications
SCHULAUFSICHT_EMAIL="schulaufsicht@example.com"
```

## Email Setup (Optional)

### Using Resend (Recommended)
1. Sign up at https://resend.com
2. Create an API key
3. Add `RESEND_API_KEY` to your `.env.local`
4. Set `FROM_EMAIL` to your verified domain email

### Development Mode
If `RESEND_API_KEY` is not set, emails will be logged to the console instead of being sent.




# Security Analysis: Autosave & Access Control

**Date:** 2025-01-10
**Status:** Critical vulnerabilities identified, fixes in progress

## Critical Vulnerabilities

### 1. No Authorization on Entry Autosave API

**Severity:** 🔴 Critical
**Files Affected:**
- `src/app/api/entries/[id]/route.ts` (PATCH, DELETE)
- `src/app/api/entries/route.ts` (POST)

**Issue:**
The autosave endpoints accept requests without verifying that the caller has permission to modify the entry. Anyone who knows or guesses an entry ID can:
- Read entry data
- Modify any field
- Delete entries from any form

**Example Attack:**
```bash
# Attacker doesn't need access code, just needs to guess/enumerate entry IDs
curl -X PATCH https://app.example.com/api/entries/clx123abc \
  -H "Content-Type: application/json" \
  -d '{"zielsetzungenText": "HACKED"}'
```

**Current Code:**
```typescript
// ❌ VULNERABLE: No access control
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  const existingEntry = await prisma.entry.findUnique({ where: { id } });
  if (!existingEntry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  // Anyone can update!
  const entry = await prisma.entry.update({ where: { id }, data: body });
  return NextResponse.json({ entry });
}
```

### 2. Dual Authentication Architecture

**Severity:** 🟡 Medium (design issue)

The application uses **two separate authentication mechanisms** that don't integrate properly:

#### System 1: Cookie-Based Auth (Schulamt)
- **Location:** `/admin/*` routes
- **Mechanism:** HTTP-only cookies (`auth-token`, `user-id`)
- **Verification:** `getCurrentUser()` in `/lib/auth.ts`
- **Used for:** Admin users creating and managing forms

#### System 2: Access Code "Auth" (Schools)
- **Location:** `/formular/[code]/*` routes
- **Mechanism:** URL parameter
- **Verification:** Database lookup in page components only
- **Used for:** Schools filling out their forms

**Problem:** The access code is only verified in **page components**, not in **API routes**. This means:
- Page: `/formular/ABC123` → verifies code exists ✅
- API: `/api/entries/[id]` → no verification ❌

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Types                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Schulamt Admin              │              School User          │
│  (Cookie Auth)               │              (Access Code)        │
│                              │                                   │
│  Login → /admin              │              /formular/ABC123    │
│    ↓                         │                ↓                 │
│  Set auth-token cookie       │              No session/cookie   │
│    ↓                         │                ↓                 │
│  CRUD Forms                  │              Fill entries        │
│    ↓                         │                ↓                 │
│  Authorization via           │              ❌ NO authorization  │
│  getCurrentUser()            │              on API calls!       │
│                              │                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Access Code Flow

**Current (Vulnerable):**
```
School user visits: /formular/ABC123
  ↓
Page component checks access code exists in DB ✅
  ↓
User edits entry, autosave triggers
  ↓
POST /api/entries/[id] with JSON body
  ↓
❌ NO check if user has access to this form!
  ↓
Entry saved (anyone can save)
```

**Required:**
```
School user visits: /formular/ABC123
  ↓
Page component checks access code exists in DB ✅
  ↓
User edits entry, autosave triggers
  ↓
POST /api/entries/[id] with JSON body + accessCode header
  ↓
✅ Verify entry belongs to form with matching accessCode
  ↓
Entry saved (only if authorized)
```

## Proposed Fixes

### Option 1: Access Code in Request Headers (Recommended)

**Pros:**
- Simple to implement
- Follows existing architecture
- No session needed for schools
- Stateless verification

**Implementation:**
```typescript
// Client sends access code with requests
fetch('/api/entries/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-Access-Code': 'ABC123',  // Add access code
  },
  body: JSON.stringify(data),
});

// Server verifies access
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const accessCode = req.headers.get('x-access-code');

  if (!accessCode) {
    return NextResponse.json({ error: "Access code required" }, { status: 401 });
  }

  // Verify entry belongs to form with this access code
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { form: { include: { accessCode: true } } },
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (entry.form.accessCode?.code !== accessCode) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
  }

  // Now safe to update
  const updated = await prisma.entry.update({ where: { id }, data: body });
  return NextResponse.json({ entry: updated });
}
```

### Option 2: Session-Based Access Code Auth

**Pros:**
- More secure (code not sent with every request)
- Follows web best practices
- Can track school user sessions

**Cons:**
- More complex implementation
- Need session management for schools
- Not necessary for this use case

### Option 3: Short-Lived JWT Tokens

**Pros:**
- Industry standard
- Self-contained authorization
- Can include expiration

**Cons:**
- Overkill for simple access code system
- Added complexity

## Recommendation

**Use Option 1** (Access Code in Headers) because:
1. ✅ Simple and quick to implement
2. ✅ Maintains stateless architecture for school users
3. ✅ Doesn't require session management
4. ✅ Access codes are already "secrets" shared via email
5. ✅ Aligns with existing URL-based access pattern

## Next.js Best Practices Applied

### Route Handler Context Pattern
```typescript
// ✅ Correct: Using async params
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
}

// ❌ Wrong (old pattern):
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
}
```

### Error Handling Patterns
```typescript
// ✅ Clear status codes
- 401: Authentication required (no access code provided)
- 403: Forbidden (invalid access code for this resource)
- 404: Resource not found
- 500: Server error
```

### Database Query Optimization
```typescript
// ✅ Efficient: Single query with includes
const entry = await prisma.entry.findUnique({
  where: { id },
  include: {
    form: {
      include: { accessCode: true }
    }
  },
});

// ❌ Inefficient: Multiple queries
const entry = await prisma.entry.findUnique({ where: { id } });
const form = await prisma.form.findUnique({ where: { id: entry.formId } });
const accessCode = await prisma.accessCode.findUnique({ where: { formId: form.id } });
```

## Testing Requirements

### Unit Tests Needed
- [ ] Verify PATCH without access code returns 401
- [ ] Verify PATCH with wrong access code returns 403
- [ ] Verify PATCH with correct access code succeeds
- [ ] Verify DELETE without access code returns 401
- [ ] Verify DELETE with wrong access code returns 403

### E2E Tests Needed
- [ ] School A cannot modify School B's entries
- [ ] Expired/invalid access codes are rejected
- [ ] Autosave works correctly with valid access code
- [ ] Direct API access without access code is blocked

## Implementation Checklist

- [ ] Add access code verification to PATCH `/api/entries/[id]`
- [ ] Add access code verification to DELETE `/api/entries/[id]`
- [ ] Add access code verification to POST `/api/entries`
- [ ] Update client autosave to send access code header
- [ ] Update AutosaveIndicator component
- [ ] Add E2E tests for authorization
- [ ] Update security documentation
- [ ] Security audit of other API endpoints

## Related Files

- `/src/app/api/entries/[id]/route.ts` - Main vulnerability
- `/src/app/api/entries/route.ts` - Entry creation
- `/src/components/AutosaveIndicator.tsx` - Client-side autosave
- `/src/components/EntryFormWithAutosaveClient.tsx` - Form component
- `/src/lib/auth.ts` - Admin authentication (separate system)

## GDPR/Privacy Implications

The current vulnerability could allow unauthorized access to school data, which violates GDPR Article 32 (Security of Processing). Schools must be assured that their data cannot be accessed or modified by other parties.

**Required disclosure:** If this vulnerability existed in production and was exploited, it would constitute a data breach requiring notification under GDPR Article 33.

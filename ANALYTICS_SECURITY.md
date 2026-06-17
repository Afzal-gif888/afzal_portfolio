# Analytics Access Control & Security

## Overview

Analytics data is **private and restricted** to the portfolio owner/admin only. This document outlines the security implementation to ensure visitors cannot access analytics data while maintaining full functionality for tracking and admin dashboards.

---

## Security Architecture

### 1. **Firestore Security Rules** (`firestore.rules`)

#### Admin User Verification
```firestore
function isAdminUser() {
  return request.auth != null && (
    request.auth.email == 'afzal.portfolio@gmail.com' ||
    request.auth.uid == 'admin_uid_placeholder'
  );
}
```

Only users with the configured admin email or UID can access analytics data.

#### Analytics Collections - Access Control

All analytics collections follow this pattern:

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| `analytics` | Admin only ✓ | Visitors only | Admin only | Admin only |
| `analyticsVisitors` | Admin only ✓ | Visitors only | Visitors only | Admin only |
| `analyticsEvents` | Admin only ✓ | Visitors only | Admin only | Admin only |
| `projectAnalytics` | Admin only ✓ | Visitors only | Visitors only | Admin only |
| `analyticsSummary` | Admin only ✓ | Visitors only | Visitors only | Admin only |

**Key Principle**: 
- ✓ **Visitors can ONLY create** (write) analytics events
- ✗ **Visitors cannot READ** analytics data
- ✓ **Admin can READ** all analytics
- ✓ **Admin can MANAGE** analytics (update/delete)

---

### 2. **Client-Side Authentication** (`context/AuthContext.tsx`)

The `AuthContext` verifies if a user is the configured admin:

```typescript
function verifyAdminAccess(user: User | null): boolean {
  if (!user) return false;
  
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdminByEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAdminByUID = ADMIN_UIDS.includes(user.uid);
  
  return isAdminByEmail || isAdminByUID;
}
```

**Exposed Hook**: `useAuth()` returns:
- `user`: Current authenticated user
- `isAdmin`: Whether the user is the configured admin
- `loading`: Authentication state loading
- `signOut`: Sign out function

---

### 3. **Admin Layout Protection** (`admin-afzal-1299/layout.tsx`)

The admin layout enforces multi-level access control:

1. **Not Authenticated** → Redirect to `/admin-afzal-1299/login`
2. **Authenticated but NOT Admin** → Redirect to `/admin-afzal-1299/access-denied`
3. **Authenticated AND Admin** → Grant full access to admin panel

---

### 4. **Analytics Dashboard Security** (`admin-afzal-1299/analytics/page.tsx`)

The analytics page includes redundant authentication checks:

```typescript
useEffect(() => {
  if (!loading) {
    if (!user) {
      router.push("/admin-afzal-1299/login");
      return;
    }
    
    if (!isAdmin) {
      setAccessError("You do not have permission to view analytics.");
      return;
    }
    
    fetchAdvancedAnalytics(); // Only runs if admin
  }
}, [loading, user, isAdmin]);
```

If a user tries to:
- Access `/admin-afzal-1299/analytics` → Firestore denies reads
- Somehow bypass auth UI → Component still blocks access
- Manipulate JWT → Firestore rules reject request

---

### 5. **Analytics Tracking Library** (`lib/analytics.ts`)

The tracking functions respect admin status:

```typescript
function isAdmin() {
  // Check if on admin route
  if (window.location.pathname.startsWith("/admin")) return true;
  
  // Verify authenticated admin
  const isAdminStorage = localStorage.getItem("isAdmin") === "true";
  if (isAdminStorage && auth.currentUser) {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    return auth.currentUser.email?.toLowerCase() === adminEmail.toLowerCase();
  }
  
  return false;
}

async function trackAdvancedEvent(action, page, metadata) {
  if (isAdmin()) return; // Admin actions don't get tracked
  // Visitors' actions are recorded...
}
```

**Purpose**: Admin doesn't pollute analytics data with their own activity.

---

## Configuration

### Admin Email Setup (`.env.local`)

```env
# Set your admin email for analytics access
NEXT_PUBLIC_ADMIN_EMAIL="your-admin-email@gmail.com"

# Optional: Additional admin UIDs (comma-separated)
NEXT_PUBLIC_ADMIN_UIDS=""
```

### Adding Additional Admin Accounts

To allow multiple admin users:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_ADMIN_UIDS="uid1,uid2,uid3"
   ```

2. Update `firestore.rules`:
   ```firestore
   function isAdminUser() {
     return request.auth != null && (
       request.auth.email == 'admin1@example.com' ||
       request.auth.email == 'admin2@example.com' ||
       request.auth.uid == 'some_admin_uid'
     );
   }
   ```

---

## Access Flow Diagram

### Public Visitor Flow
```
Visitor (unauthenticated)
    ↓
Page Load → Analytics Tracking (write-only)
    ↓
Firestore Rules Check: isAuthenticatedUser() == false ✓ ALLOW
    ↓
Events recorded in:
- analyticsVisitors
- analyticsEvents
- projectAnalytics

Try to READ /admin-afzal-1299/analytics
    ↓
Auth Layout: !isAdmin → Access Denied Page
    ↓
Firestore Rules: isAdminUser() == false ✗ DENY
```

### Admin Flow
```
Admin User (authenticated with admin email)
    ↓
Login → Firebase Auth
    ↓
AuthContext: verifyAdminAccess(user) == true → isAdmin = true
    ↓
Navigate to /admin-afzal-1299/analytics
    ↓
Admin Layout: isAdmin == true → Show sidebar + analytics
    ↓
Analytics Page: Fetch data
    ↓
Firestore Rules: isAdminUser() == true ✓ ALLOW
    ↓
Analytics dashboard displays all data:
- Visitor history
- Event logs
- Project analytics
- Traffic reports
```

---

## Security Guarantees

### ✓ What's Prevented

- **Unauthorized data access**: Visitors cannot query analytics collections
- **Data modification**: Only admin can update/delete analytics
- **Analytics read bypass**: Even with Firestore API key visible, reads are denied
- **JWT manipulation**: Server-side rules enforce email/UID validation
- **Session hijacking**: Authentication state verified client-side and server-side

### ✓ What's Protected

- ✓ Visitor IDs and tracking records
- ✓ Event logs (resume downloads, LinkedIn clicks, GitHub clicks)
- ✓ Project view analytics
- ✓ Traffic patterns and device information
- ✓ Analytics dashboard and reports

### ✓ What's Allowed

- ✓ Visitors can create analytics events
- ✓ Visitors can create their own visitor records
- ✓ Admin can view all analytics
- ✓ Admin can manage analytics data
- ✓ Public can view portfolio (non-analytics data)

---

## Testing Security

### Test 1: Visitor Cannot Access Analytics
```javascript
// Try accessing as visitor (non-authenticated)
const visitorsSnap = await getDocs(collection(db, "analyticsVisitors"));
// Result: PERMISSION_DENIED error
```

### Test 2: Non-Admin User Cannot Access
```javascript
// Sign in with non-admin email
const nonAdminEmail = "someone@example.com";
// Navigate to /admin-afzal-1299/analytics
// Result: Redirected to access-denied page
```

### Test 3: Admin Can Access
```javascript
// Sign in with admin email (afzal.portfolio@gmail.com)
const adminEmail = "afzal.portfolio@gmail.com";
// Navigate to /admin-afzal-1299/analytics
// Result: Full analytics dashboard displayed
```

### Test 4: Admin Activity Not Tracked
```javascript
// Sign in as admin
// Browse portfolio
// Check analytics events
// Result: Admin's own page views are NOT recorded
```

---

## Deployment Checklist

- [ ] Update `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local` with your email
- [ ] Verify Firestore rules are deployed (`firebase deploy --only firestore:rules`)
- [ ] Test analytics tracking as visitor
- [ ] Test admin dashboard access with admin account
- [ ] Test access denial with non-admin account
- [ ] Verify visitor can create but not read events
- [ ] Check that admin activity is excluded from analytics

---

## Troubleshooting

### Analytics Not Recording
**Problem**: Visitor analytics not being created
**Solution**: 
- Check Firestore rules allow `isAuthenticatedUser() == false` for creates
- Verify visitor is not admin (would be skipped)
- Check browser console for errors

### Admin Cannot Access Dashboard
**Problem**: Admin gets access denied
**Solution**:
- Verify `NEXT_PUBLIC_ADMIN_EMAIL` matches login email (case-insensitive)
- Check `verifyAdminAccess()` returns true
- Ensure Firestore rules email matches exactly
- Try signing out and back in

### Security Bypass Attempts
**Problem**: User claims they accessed analytics via API
**Solution**:
- Firestore rules deny all reads except isAdminUser()
- API key is public but cannot bypass auth requirements
- Check Firebase Console audit logs
- Verify email/UID in Firestore rules

---

## Architecture Summary

| Layer | Security Method |
|-------|-----------------|
| **Firestore Rules** | Email/UID validation, read-only for admin |
| **Auth Context** | Admin email verification |
| **Admin Layout** | Route-level access control |
| **Page Components** | Authentication state checks |
| **Analytics Lib** | Admin activity exclusion |

**Defense in Depth**: Multiple security layers ensure analytics data cannot be accessed even if one layer is compromised.

# Implementation Guide

This guide will help you implement the server-side rendering blog and credential management system in your Next.js portfolio website.

## 1. Server-Side Blog Rendering Implementation

### Step 1: Update Blog Page Components

Replace your existing blog page components with the server-side rendering versions:

- `app/blog/page.tsx` - Main blog listing page
- `app/blog/[slug]/page.tsx` - Individual blog post page

Both files now include:
```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

These directives tell Next.js to always render these pages server-side on every request, ensuring you always see the latest content.

### Step 2: Update Markdown Utilities

Replace your `lib/utils/markdown.ts` file with the updated version that:
- Uses `cache: 'no-store'` for fetch requests to ensure fresh content
- Includes better error handling for real-time data fetching
- Maintains proper typing for blog post data

## 2. Credentials Management System Implementation

### Step 1: Install Required Dependencies

```bash
npm install bcrypt @types/bcrypt
# or
yarn add bcrypt @types/bcrypt
```

### Step 2: Add Type Definitions

Create the file `lib/types/auth.ts` with type definitions for:
- `Credentials` - Admin username and password
- `JwtPayload` - JSON Web Token payload structure
- `AuthVerification` - Authentication verification result
- `PasswordChangeRequest` - Password change request structure
- `PasswordChangeResponse` - Password change response structure

### Step 3: Create Credentials Management System

Add the file `lib/auth/credentials.ts` implementing:
- `getCredentials()` - Gets current credentials from file or env vars
- `updateCredentials()` - Updates credentials with password hashing
- `verifyCredentials()` - Verifies username and password

### Step 4: Create Default Credentials File

Create a file `credentials.json` in your project root:

```json
{
  "username": "admin",
  "password": "password"
}
```

### Step 5: Update API Routes

Replace your authentication API routes:
- `app/api/admin/auth/route.ts` - Updated for credential system
- `app/api/admin/change-password/route.ts` - New route for password changes

### Step 6: Update Settings Panel Component

Fix the TypeScript errors in your `components/admin/settings-panel.tsx` component:
- Add proper return type: `export default function SettingsPanel(): JSX.Element`
- Fix nested state update functions
- Improve type safety for form handling

## 3. Configuration Updates

### Environment Variables

Add the following to your `.env.local` file:

```
JWT_SECRET=your-secret-key-change-me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
```

### Type Safety for bcrypt

Add the proper type definitions for bcrypt to avoid TypeScript issues.

## 4. Testing Your Implementation

### Testing Server-Side Blog Rendering

1. Deploy your site to Vercel
2. Upload a new blog post to Vercel Blob storage
3. Verify the new post appears on your blog without redeploying

### Testing Credential Management

1. Log in to your admin dashboard
2. Go to Settings > Account
3. Update your password using the security form
4. Log out and log back in with the new password
5. Verify the password has been updated and hashed in credentials.json

## 5. Security Considerations

- In production, consider using environment variables exclusively rather than a credentials file
- Ensure credentials.json is added to .gitignore to prevent accidental exposure
- Use a strong JWT_SECRET in production
- Implement password complexity requirements
- Consider adding rate limiting to authentication
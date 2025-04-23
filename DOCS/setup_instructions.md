# Setup Instructions

## Server-Side Blog Rendering

Your blog now renders server-side, which means:

1. Posts will always be up-to-date without requiring a site redeploy
2. When you upload a new post to Vercel Blob storage, it will immediately appear on your site
3. Any edits to existing posts will be reflected immediately

This is achieved by using Next.js's server-side rendering capabilities with the `dynamic = 'force-dynamic'` and `revalidate = 0` directives in the blog pages.

## Credentials Management System

The new credentials management system allows you to:

1. Change your admin password securely
2. Store credentials in a local JSON file
3. Use bcrypt for secure password hashing

### Setup Steps

1. **Install the required dependencies**:
   ```bash
   npm install bcrypt @types/bcrypt
   # or
   yarn add bcrypt @types/bcrypt
   ```

2. **Create the initial credentials file**:
   - Create a file named `credentials.json` in the root of your project with the following content:
   ```json
   {
     "username": "admin",
     "password": "password"
   }
   ```
   - This file will store your admin credentials
   - The first time you change your password, it will be hashed automatically

3. **Environment Variables**:
   - If no credentials file is found, the system will fall back to using these environment variables
   - Add to your `.env.local` file:
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=password
   JWT_SECRET=your-secret-key-change-me
   ```

### Usage

1. **Changing Password**:
   - Log in to the admin dashboard
   - Go to the Settings tab
   - Select the Account tab
   - Fill in your current password and new password
   - Click "Update Security Settings"
   - The password will be securely hashed and stored in `credentials.json`

2. **Uploading Blog Posts**:
   - Upload Markdown (.md) files to the `posts/` directory in your Vercel Blob storage
   - The blog will automatically display the latest posts without redeployment
   - Frontmatter format example:
   ```markdown
   ---
   title: "My New Blog Post"
   date: "2025-04-22"
   excerpt: "A brief description of the post"
   category: "Next.js"
   featured: true
   ---

   # My Blog Post Content
   
   Content goes here...
   ```

### Security Considerations

1. **Credentials File**:
   - The `credentials.json` file contains sensitive information
   - In production, ensure this file is not publicly accessible
   - Consider using environment variables exclusively in production

2. **JWT Secret**:
   - Change the default JWT secret key in your environment variables
   - Use a strong random string for better security

3. **Password Requirements**:
   - Passwords should be at least 8 characters
   - For better security, use a mix of uppercase, lowercase, numbers, and symbols

## Troubleshooting

If you encounter issues:

1. **Server-Side Rendering Not Working**:
   - Ensure `dynamic = 'force-dynamic'` is set in your page components
   - Check that `revalidate = 0` is properly set
   - Verify your Next.js version supports these features

2. **Password Change Fails**:
   - Check if `credentials.json` is writable by the application
   - Ensure bcrypt is properly installed
   - Verify that the current password you entered is correct

3. **Blog Posts Not Updating**:
   - Verify that your Vercel Blob storage is correctly configured
   - Check that posts follow the correct Markdown format with frontmatter
   - Ensure file paths use the `posts/` prefix in Blob storage

## Next Steps

Consider these enhancements for future updates:

1. **Admin UI for Uploading Posts**:
   - Create a file upload interface in the admin dashboard
   - Directly upload markdown files to Vercel Blob storage

2. **Enhanced Password Policies**:
   - Implement stronger password requirements
   - Add password expiration functionality

3. **Multi-User Support**:
   - Extend the credentials system to support multiple users
   - Add role-based permissions
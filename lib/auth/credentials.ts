// lib/auth/credentials.ts

import fs from 'fs';
import path from 'path';
import { hash, compare } from 'bcrypt';
import { Credentials } from '@/lib/types/auth';

// Credentials file path (relative to project root)
const CREDENTIALS_FILE = path.join(process.cwd(), 'credentials.json');

/**
 * Get the current admin credentials
 * Falls back to environment variables if file doesn't exist
 */
export async function getCredentials(): Promise<Credentials> {
  try {
    // Check if credentials file exists
    if (fs.existsSync(CREDENTIALS_FILE)) {
      // Read and parse credentials from the file
      const fileContent = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      const credentials = JSON.parse(fileContent);
      
      return {
        username: credentials.username,
        password: credentials.password // This should be hashed
      };
    } else {
      // Fallback to environment variables
      return {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'password'
      };
    }
  } catch (error) {
    console.error('Error getting credentials:', error);
    
    // Return default values in case of error
    return {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'password'
    };
  }
}

/**
 * Update admin credentials
 * @param username - New username
 * @param password - New password (plain text, will be hashed)
 */
export async function updateCredentials(username: string, password: string): Promise<boolean> {
  try {
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the credentials object
    const credentials: Credentials = {
      username,
      password: hashedPassword
    };
    
    // Save to file
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating credentials:', error);
    return false;
  }
}

/**
 * Verify user credentials
 * @param username - Username to verify
 * @param password - Password to verify (plain text)
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  try {
    const credentials = await getCredentials();
    
    // First check if username matches
    if (username !== credentials.username) {
      return false;
    }
    
    // If the password in the file is hashed (starts with $2b$)
    if (credentials.password.startsWith('$2b$')) {
      // Compare with bcrypt
      return compare(password, credentials.password);
    } else {
      // Direct comparison (for backward compatibility with non-hashed passwords)
      return password === credentials.password;
    }
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return false;
  }
}
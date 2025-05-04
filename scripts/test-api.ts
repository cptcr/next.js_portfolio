#!/usr/bin/env tsx
/**
 * API Testing Script for V1 Endpoints (using x-api-key)
 *
 * This script tests the API endpoints presumed to be under /api/v1/
 * for posts and users routes, using API Key authentication via the
 * 'x-api-key' header.
 *
 * It prompts the user for the API base URL and an API key, then tests
 * various endpoints to validate the API functionality.
 *
 * Usage: npm run test_api
 */

import readline from 'readline';
import chalk from 'chalk';
import { setTimeout as delay } from 'timers/promises';

// --- Configuration ---

// Default base URL for the v1 API endpoints
const DEFAULT_API_BASE_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/v1`;
let API_BASE_URL = DEFAULT_API_BASE_URL;

// V1 Endpoints relative to the base URL
const ENDPOINTS = {
  POSTS: '/posts', // Corresponds to /api/v1/posts
  USERS: '/users', // Corresponds to /api/v1/users
};

// Debug mode flag
let DEBUG_MODE = false;

// --- Utilities ---

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper for prompting the user
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim()); // Trim whitespace from answers
    });
  });
};

// Log helpers with colors
const logInfo = (message: string) => console.log(chalk.blue(`ℹ️  ${message}`));
const logSuccess = (message: string) => console.log(chalk.green(`✅ ${message}`));
const logError = (message: string) => console.log(chalk.red(`❌ ${message}`));
const logWarning = (message: string) => console.log(chalk.yellow(`⚠️  ${message}`));
const logSection = (message: string) => console.log(chalk.magenta(`\n📋 ${message}`));
const logDebug = (message: string) => {
  if (DEBUG_MODE) {
    console.log(chalk.gray(`🔍 DEBUG: ${message}`));
  }
};

// Helper function to mask API key for logging
const maskApiKey = (key: string): string => {
  if (!key) return '***';
  return key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***';
};

// --- API Test Functions ---

/**
 * Checks basic connectivity to the API Base URL.
 */
async function checkServerConnectivity(): Promise<boolean> {
  logSection('Checking API Server Connectivity');
  try {
    logInfo(`Attempting to connect to ${API_BASE_URL}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    // Fetch base URL or a known simple endpoint if base URL gives 404
    // Here we fetch the base URL, expecting 2xx or 404 as signs of life.
    const response = await fetch(API_BASE_URL, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok || response.status === 404) {
      logSuccess(`Server is reachable (Status: ${response.status} at ${API_BASE_URL})`);
      return true;
    } else {
      logWarning(
        `Server responded with unexpected status ${response.status} at ${API_BASE_URL}. Tests might fail.`,
      );
      return true; // Server responded, even if unexpectedly
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logError(`Could not connect: Request to ${API_BASE_URL} timed out (5s).`);
    } else {
      logError(
        `Could not connect to ${API_BASE_URL}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    logInfo(
      'Troubleshooting: Is the API server running? Is the URL correct? Check network/firewall.',
    );
    return false;
  }
}

/**
 * Tests GET /posts (list posts) with and without parameters.
 * Assumes 'x-api-key' authentication.
 */
async function testGetPosts(apiKey: string): Promise<{ success: boolean; posts: any[] }> {
  logSection(`Testing GET ${ENDPOINTS.POSTS} (List Posts)`);
  let posts: any[] = [];
  const headers = { 'x-api-key': apiKey };

  try {
    // Test with default parameters
    logInfo('Sending GET request (default params)...');
    const defaultUrl = `${API_BASE_URL}${ENDPOINTS.POSTS}`;
    logDebug(`Request URL: ${defaultUrl}`);
    logDebug(`Headers: { 'x-api-key': '${maskApiKey(apiKey)}' }`);
    const response = await fetch(defaultUrl, { method: 'GET', headers });
    const data = await response.json();
    logDebug(`Default - Status: ${response.status}, Response: ${JSON.stringify(data)}`);

    if (!response.ok) {
      logError(
        `Default GET failed (Status: ${response.status}) - Error: ${data.message || JSON.stringify(data)}`,
      );
      // Decide if we should continue testing params if default fails
      // return { success: false, posts }; // Option: fail fast
    } else {
      logSuccess(
        `Default GET successful (Status: ${response.status}) - Retrieved ${data.posts?.length ?? 0} posts`,
      );
      posts = data.posts || [];
      if (data.pagination) logInfo(`Pagination: ${JSON.stringify(data.pagination)}`);
    }

    // Test with query parameters (limit=5, offset=0)
    logInfo('\nSending GET request (limit=5, offset=0)...');
    const paramsUrl = `${API_BASE_URL}${ENDPOINTS.POSTS}?limit=5&offset=0`;
    logDebug(`Request URL: ${paramsUrl}`);
    const paramsResponse = await fetch(paramsUrl, { method: 'GET', headers });
    const paramsData = await paramsResponse.json();
    logDebug(`Params - Status: ${paramsResponse.status}, Response: ${JSON.stringify(paramsData)}`);

    if (!paramsResponse.ok) {
      logError(
        `Params GET failed (Status: ${paramsResponse.status}) - Error: ${paramsData.message || JSON.stringify(paramsData)}`,
      );
    } else {
      logSuccess(
        `Params GET successful (Status: ${paramsResponse.status}) - Retrieved ${paramsData.posts?.length ?? 0} posts`,
      );
    }

    // Success requires both attempts to be OK in this combined test function
    const overallSuccess = response.ok && paramsResponse.ok;
    if (!overallSuccess) {
      logWarning('One or more GET /posts requests failed.');
    }
    return { success: overallSuccess, posts };
  } catch (error) {
    logError(
      `Exception during GET ${ENDPOINTS.POSTS} test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    return { success: false, posts };
  }
}

/**
 * Tests GET /posts/:slug (fetch single post).
 * Assumes 'x-api-key' authentication.
 */
async function testGetSinglePost(
  apiKey: string,
  slug: string,
  context: string = '',
): Promise<boolean> {
  const contextMsg = context ? ` (${context})` : '';
  logSection(`Testing GET ${ENDPOINTS.POSTS}/${slug}${contextMsg}`);

  if (!slug) {
    logError('Cannot test GET single post: No slug provided.');
    return false;
  }
  const headers = { 'x-api-key': apiKey };
  const url = `${API_BASE_URL}${ENDPOINTS.POSTS}/${slug}`;

  try {
    logInfo(`Sending GET request for slug: ${slug}...`);
    logDebug(`Request URL: ${url}`);
    logDebug(`Headers: { 'x-api-key': '${maskApiKey(apiKey)}' }`);
    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json();
    logDebug(`Status: ${response.status}, Response: ${JSON.stringify(data)}`);

    if (response.ok) {
      logSuccess(`GET successful (Status: ${response.status})`);
      if (data.post) {
        logInfo(`Post Title: ${data.post.title}`);
      } else {
        logWarning('Response OK but no post data found in the response key "post".');
      }
    } else {
      logError(
        `GET failed (Status: ${response.status}) - Error: ${data.message || JSON.stringify(data)}`,
      );
      if (response.status === 404) logError('Verify the slug exists and the API route is correct.');
    }
    return response.ok;
  } catch (error) {
    logError(
      `Exception during GET ${ENDPOINTS.POSTS}/${slug} test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    return false;
  }
}

/**
 * Tests GET /users (list users).
 * Assumes 'x-api-key' authentication.
 */
async function testGetUsers(apiKey: string): Promise<{ success: boolean; users: any[] }> {
  logSection(`Testing GET ${ENDPOINTS.USERS} (List Users)`);
  let users: any[] = [];
  const headers = { 'x-api-key': apiKey };
  const url = `${API_BASE_URL}${ENDPOINTS.USERS}`;

  try {
    logInfo('Sending GET request...');
    logDebug(`Request URL: ${url}`);
    logDebug(`Headers: { 'x-api-key': '${maskApiKey(apiKey)}' }`);
    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json();
    logDebug(`Status: ${response.status}, Response: ${JSON.stringify(data)}`);

    if (response.ok) {
      logSuccess(
        `GET successful (Status: ${response.status}) - Retrieved ${data.users?.length ?? 0} users`,
      );
      users = data.users || [];
      if (users.length > 0) logInfo(`Sample user: ${JSON.stringify(users[0])}`);
    } else {
      logError(
        `GET failed (Status: ${response.status}) - Error: ${data.message || JSON.stringify(data)}`,
      );
      if (response.status === 401 || response.status === 403)
        logError('Check API key validity and permissions for users endpoint.');
    }
    return { success: response.ok, users };
  } catch (error) {
    logError(
      `Exception during GET ${ENDPOINTS.USERS} test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    return { success: false, users };
  }
}

/**
 * Tests POST /posts (create post).
 * Assumes 'x-api-key' authentication and server-side author assignment.
 * @param users Optional: Previously fetched users for validation logging.
 * @param posts Optional: Previously fetched posts for category selection.
 * @param associatedUserId Optional: User ID expected to be linked to the API key (for logging only).
 */
async function testPostCreation(
  apiKey: string,
  users: any[],
  posts: any[],
  associatedUserId?: number,
): Promise<{ success: boolean; slug: string | null }> {
  logSection(`Testing POST ${ENDPOINTS.POSTS} (Create Post)`);
  const url = `${API_BASE_URL}${ENDPOINTS.POSTS}`;
  const headers = { 'x-api-key': apiKey, 'Content-Type': 'application/json' };

  try {
    logInfo('Preparing post creation request...');

    // Determine a category
    let validCategory = 'General'; // Default
    if (posts?.length > 0) {
      const firstCategory = posts.find((p) => p.category)?.category;
      if (firstCategory) {
        validCategory = firstCategory;
        logInfo(`Using category "${validCategory}" from first existing post.`);
      } else {
        logInfo(`Using default category "${validCategory}" (no categories in existing posts).`);
      }
    } else {
      logInfo(`Using default category "${validCategory}" (no existing posts found).`);
    }

    // Log user association info (for context, not sent in request)
    if (associatedUserId !== undefined) {
      const user = users?.find((u) => u.id === associatedUserId);
      if (user) {
        logInfo(`API key is expected to belong to user ID ${associatedUserId} (${user.username}).`);
      } else {
        logWarning(`Provided user ID ${associatedUserId} was NOT found in fetched user list.`);
      }
      logInfo('The API should automatically assign the author based on the key.');
    } else {
      logInfo('Assuming API will assign author based on the provided API key.');
    }

    // Prepare payload - IMPORTANT: authorId is NOT sent, API determines it
    const now = new Date();
    const timestamp = now.toISOString();
    const testPost = {
      title: `Test Post - ${timestamp}`,
      excerpt: 'Test post created by API script.',
      category: validCategory,
      content: `Content generated at ${now.toLocaleTimeString()}.`,
      featured: false,
      date: timestamp, // Assuming API expects 'date' (ISO format)
    };

    logInfo('\nSending POST request...');
    logInfo(`Payload: ${JSON.stringify(testPost)}`);
    logDebug(`Request URL: ${url}`);
    logDebug(
      `Headers: { 'x-api-key': '${maskApiKey(apiKey)}', 'Content-Type': 'application/json' }`,
    );

    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(testPost) });
    let data: any = {};
    let responseText = '';

    try {
      responseText = await response.text();
      if (responseText) data = JSON.parse(responseText);
      logDebug(`Status: ${response.status}, Response: ${responseText}`);
    } catch (parseError) {
      logError(
        `Error parsing JSON response (Status: ${response.status}): ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      );
      logDebug(`Raw Response: ${responseText}`);
      return { success: false, slug: null }; // Treat parse error as failure
    }

    if (response.ok) {
      logSuccess(`POST successful (Status: ${response.status})`);
      const createdSlug = data.slug ?? data.post?.slug ?? null;
      const createdId = data.id ?? data.post?.id ?? 'unknown';
      logSuccess(`Post created (ID: ${createdId}, Slug: ${createdSlug || 'N/A'})`);
      return { success: true, slug: createdSlug };
    } else {
      // Handle known error statuses
      logError(`POST failed (Status: ${response.status})`);
      logError(`Error Message: ${data.message || responseText || 'No specific message returned.'}`);
      if (data.error) logError(`Detailed Error: ${JSON.stringify(data.error)}`);

      if (response.status === 401 || response.status === 403) {
        logError(
          'Authentication/Authorization Failed: Check API key validity and permissions for creating posts.',
        );
      } else if (response.status === 400 || response.status === 422) {
        logError(
          'Bad Request / Validation Error: Check the payload structure and required fields.',
        );
        logError(`Sent Payload: ${JSON.stringify(testPost)}`);
      } else if (response.status === 500) {
        logError('Internal Server Error: The API backend failed processing the request.');
        logError(
          'Possible causes: Database connection issue, Foreign Key constraint (e.g., authorId invalid/missing), Bug in API code.',
        );
        logError('Check the API server logs for detailed error information.');
      }
      return { success: false, slug: null };
    }
  } catch (error) {
    logError(
      `Exception during POST ${ENDPOINTS.POSTS} test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    return { success: false, slug: null };
  }
}

/**
 * Tests PUT /posts/:slug (update post).
 * Assumes 'x-api-key' authentication.
 */
async function testPostUpdate(apiKey: string, slug: string): Promise<boolean> {
  logSection(`Testing PUT ${ENDPOINTS.POSTS}/${slug} (Update Post)`);

  if (!slug) {
    logError('Cannot test PUT update: No slug provided.');
    return false;
  }
  const url = `${API_BASE_URL}${ENDPOINTS.POSTS}/${slug}`;
  const headers = { 'x-api-key': apiKey, 'Content-Type': 'application/json' };
  const updateData = {
    title: `Updated Post - ${new Date().toISOString()}`,
    excerpt: 'This post was updated.',
    featured: true,
  };

  try {
    logInfo(`Sending PUT request for slug: ${slug}...`);
    logInfo(`Update Payload: ${JSON.stringify(updateData)}`);
    logDebug(`Request URL: ${url}`);
    logDebug(
      `Headers: { 'x-api-key': '${maskApiKey(apiKey)}', 'Content-Type': 'application/json' }`,
    );

    const response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(updateData) });
    let data: any = {};
    let responseText = '';

    try {
      responseText = await response.text();
      if (responseText) data = JSON.parse(responseText);
      logDebug(`Status: ${response.status}, Response: ${responseText}`);
    } catch (parseError) {
      logError(
        `Error parsing JSON response (Status: ${response.status}): ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      );
      logDebug(`Raw Response: ${responseText}`);
      return false; // Treat parse error as failure
    }

    if (response.ok) {
      logSuccess(`PUT successful (Status: ${response.status})`);
      const updatedPost = data.post ?? data;
      if (updatedPost && updatedPost.title) {
        logInfo(`Updated Title: ${updatedPost.title}`);
      } else {
        logWarning('PUT successful but response did not contain expected post data.');
      }
    } else {
      logError(`PUT failed (Status: ${response.status})`);
      logError(`Error Message: ${data.message || responseText || 'No specific message returned.'}`);
      if (response.status === 404) logError('Post not found. Was it deleted or slug changed?');
      if (response.status === 401 || response.status === 403)
        logError('Check API key permissions for updating posts.');
      if (response.status === 400 || response.status === 422)
        logError('Check update payload for validation errors.');
    }
    return response.ok;
  } catch (error) {
    logError(
      `Exception during PUT ${ENDPOINTS.POSTS}/${slug} test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    return false;
  }
}

// --- Main Execution Logic ---

async function main() {
  console.log(chalk.bold.blue('\n🔑 API v1 (x-api-key) Testing Script 🔑\n'));

  try {
    // --- Setup ---
    const customApiUrl = await prompt(`Enter API v1 base URL (default: ${DEFAULT_API_BASE_URL}): `);
    if (customApiUrl) API_BASE_URL = customApiUrl;
    logInfo(`Using API Base URL: ${chalk.yellow(API_BASE_URL)}`);

    const debugResponse = await prompt('Enable debug mode? (y/N): ');
    DEBUG_MODE = debugResponse.toLowerCase() === 'y';
    if (DEBUG_MODE) logInfo('Debug mode enabled.');

    const apiKey = await prompt('Please enter your API key (for x-api-key header): ');
    if (!apiKey) {
      logError('No API key provided. Exiting.');
      rl.close();
      return;
    }
    logInfo(`Using API key: ${maskApiKey(apiKey)}`);

    logSection('Authentication Assumptions for V1 API');
    logInfo('1. API uses the `x-api-key` header.');
    logInfo('2. Key is associated with a user in the backend.');
    logInfo('3. API determines authorId from the key for POST/PUT.');

    let userId: number | undefined = undefined;
    let fetchedUsers: any[] = [];
    const userIdInput = await prompt(
      'Optional: Enter User ID associated with key (for validation log, leave blank to skip): ',
    );
    if (userIdInput) {
      const parsedId = parseInt(userIdInput, 10);
      if (!isNaN(parsedId)) userId = parsedId;
      else logWarning('Invalid User ID input ignored.');
    }

    // --- Connectivity Check ---
    if (!(await checkServerConnectivity())) {
      const proceed = await prompt('Server connectivity check failed. Proceed anyway? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        logInfo('Exiting...');
        rl.close();
        return;
      }
      logWarning('Proceeding despite connectivity issues...');
    }

    // --- Test Selection ---
    const testsToRunInput = await prompt(
      'Tests to run? (all, posts, users - comma-separated or "all" [default]): ',
    ).then((res) => res.toLowerCase() || 'all');

    const runAll = testsToRunInput.includes('all');
    const runPosts = runAll || testsToRunInput.includes('posts');
    const runUsers = runAll || testsToRunInput.includes('users');

    if (!runPosts && !runUsers) {
      logWarning('No valid tests selected. Exiting.');
      rl.close();
      return;
    }
    logInfo(`Selected tests: ${runAll ? 'all' : testsToRunInput.split(',').join(', ')}`);
    logInfo('Starting API tests...');
    await delay(500);

    // --- Test Execution ---
    const results: Record<string, boolean | string> = {};
    let posts: any[] = [];
    let createdSlug: string | null = null; // Store slug from successful POST

    // Fetch Users if needed (required for context in POST test even if only posts are run)
    if (runUsers || runPosts) {
      logInfo('Fetching initial user data...');
      const usersResult = await testGetUsers(apiKey);
      fetchedUsers = usersResult.users;
      if (runUsers) {
        results[`GET ${ENDPOINTS.USERS}`] = usersResult.success;
      } else {
        // Log success/failure even if users test wasn't explicitly requested
        logInfo(
          `Initial GET ${ENDPOINTS.USERS} ${usersResult.success ? 'succeeded' : 'failed'}. Used for context.`,
        );
      }
      // Validate provided userId
      if (userId !== undefined) {
        if (fetchedUsers.find((u) => u.id === userId))
          logSuccess(`Provided user ID ${userId} found in fetched list.`);
        else logWarning(`Provided user ID ${userId} was NOT found in fetched list.`);
      }
      await delay(500);
    } else {
      results[`GET ${ENDPOINTS.USERS}`] = 'SKIPPED';
    }

    // Run Posts tests
    if (runPosts) {
      const postsResult = await testGetPosts(apiKey);
      results[`GET ${ENDPOINTS.POSTS} (List)`] = postsResult.success;
      posts = postsResult.posts;
      await delay(500);

      // Test POST only if listing worked (optional dependency)
      if (postsResult.success || true) {
        // Allow attempting POST even if GET failed? Set to true.
        const postCreateResult = await testPostCreation(apiKey, fetchedUsers, posts, userId);
        results[`POST ${ENDPOINTS.POSTS}`] = postCreateResult.success;
        createdSlug = postCreateResult.slug;
        await delay(500);
      } else {
        results[`POST ${ENDPOINTS.POSTS}`] = 'SKIPPED (Prerequisite GET failed)';
        createdSlug = null;
      }

      // Test actions requiring a created slug
      if (createdSlug) {
        results[`GET ${ENDPOINTS.POSTS}/${createdSlug} (Created)`] = await testGetSinglePost(
          apiKey,
          createdSlug,
          'Created',
        );
        await delay(500);

        results[`PUT ${ENDPOINTS.POSTS}/${createdSlug}`] = await testPostUpdate(
          apiKey,
          createdSlug,
        );
        await delay(500);

        // Verify update
        if (results[`PUT ${ENDPOINTS.POSTS}/${createdSlug}`] === true) {
          results[`GET ${ENDPOINTS.POSTS}/${createdSlug} (Updated)`] = await testGetSinglePost(
            apiKey,
            createdSlug,
            'Updated',
          );
          await delay(500);
        } else {
          results[`GET ${ENDPOINTS.POSTS}/${createdSlug} (Updated)`] = 'SKIPPED (Update failed)';
        }
      } else {
        results[`GET ${ENDPOINTS.POSTS}/:slug (Created)`] = 'SKIPPED (POST failed or no slug)';
        results[`PUT ${ENDPOINTS.POSTS}/:slug`] = 'SKIPPED (POST failed or no slug)';
        results[`GET ${ENDPOINTS.POSTS}/:slug (Updated)`] = 'SKIPPED';
      }

      // Test GET on an existing post (if any found initially)
      if (posts.length > 0 && posts[0].slug) {
        results[`GET ${ENDPOINTS.POSTS}/${posts[0].slug} (Existing)`] = await testGetSinglePost(
          apiKey,
          posts[0].slug,
          'Existing',
        );
        await delay(500);
      } else {
        results[`GET ${ENDPOINTS.POSTS}/:slug (Existing)`] = 'SKIPPED (No existing posts found)';
      }
    } else {
      results[`GET ${ENDPOINTS.POSTS} (List)`] = 'SKIPPED';
      results[`POST ${ENDPOINTS.POSTS}`] = 'SKIPPED';
      results[`GET ${ENDPOINTS.POSTS}/:slug (Created)`] = 'SKIPPED';
      results[`PUT ${ENDPOINTS.POSTS}/:slug`] = 'SKIPPED';
      results[`GET ${ENDPOINTS.POSTS}/:slug (Updated)`] = 'SKIPPED';
      results[`GET ${ENDPOINTS.POSTS}/:slug (Existing)`] = 'SKIPPED';
    }

    // --- Summary ---
    logSection('Test Results Summary');
    let passed = 0,
      failed = 0,
      skipped = 0;
    Object.entries(results).forEach(([endpoint, result]) => {
      if (result === true) {
        logSuccess(`${endpoint}: PASSED`);
        passed++;
      } else if (result === false) {
        logError(`${endpoint}: FAILED`);
        failed++;
      } else {
        logWarning(`${endpoint}: ${result}`);
        skipped++;
      }
    });

    console.log('\n---');
    const totalExecuted = passed + failed;
    if (totalExecuted === 0 && skipped > 0) {
      logWarning('No tests were executed.');
    } else if (failed === 0 && passed > 0) {
      logSuccess(`✨ All ${passed} executed tests passed! ✨`);
    } else {
      logWarning(`⚠️ ${failed} out of ${totalExecuted} executed tests failed. Review logs. ⚠️`);
    }
    if (skipped > 0) logInfo(`${skipped} tests were skipped.`);
    console.log('---');
  } catch (error) {
    logError(
      `An unexpected error occurred in the main script: ${error instanceof Error ? error.message : String(error)}`,
    );
    if (DEBUG_MODE && error instanceof Error) logDebug(`Stack: ${error.stack}`);
  } finally {
    rl.close();
  }
}

// Run the script
main().catch((error) => {
  console.error(chalk.redBright('\n💥 Unhandled critical error in main execution:'), error);
  process.exit(1);
});

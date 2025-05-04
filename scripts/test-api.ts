#!/usr/bin/env tsx
/**
 * API Testing Script
 *
 * This script tests the API endpoints for posts and users routes.
 * It prompts the user for an API key and then tests various
 * endpoints to validate the API functionality.
 *
 * Usage: npm run test_api
 */

import readline from 'readline';
import chalk from 'chalk';
import { setTimeout as delay } from 'timers/promises';

// Constants and configuration
const DEFAULT_API_BASE_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/v1`;
let API_BASE_URL = DEFAULT_API_BASE_URL;

const ENDPOINTS = {
  POSTS: '/posts',
  USERS: '/users',
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper for prompting the user
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Log helpers with colors for better readability
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

// Debug mode flag
let DEBUG_MODE = false;

// Helper function to check server connectivity
async function checkServerConnectivity(): Promise<boolean> {
  logSection('Checking API Server Connectivity');

  try {
    logInfo(`Attempting to connect to ${API_BASE_URL}...`);

    // Try a simple fetch to check if the server is reachable
    const controller = new AbortController();
    // Use global setTimeout for aborting fetch
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Allow 404 on base URL as it might not be a valid endpoint itself
    if (response.ok || response.status === 404) {
      logSuccess(`Server is reachable! Status: ${response.status}`);
      return true;
    } else {
      logWarning(`Server returned status ${response.status}. Tests may fail.`);
      // Still return true as the server *responded*
      return true;
    }
  } catch (error: any) {
    // Handle fetch errors (network issue, DNS, timeout, etc.)
    if (error.name === 'AbortError') {
        logError(`Could not connect to server: Request timed out after 5 seconds.`);
    } else {
        logError(`Could not connect to server: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Print troubleshooting information
    logSection('Troubleshooting Tips');
    logInfo(`1. Make sure your API server is running at ${API_BASE_URL}`);
    logInfo('2. Check if your server is using HTTPS (if so, ensure certificates are valid)');
    logInfo('3. Verify network connectivity and firewall settings');
    logInfo('4. If using localhost, ensure the API is listening on the correct port');

    return false;
  }
}

// Test GET request for listing posts
async function testGetPosts(apiKey: string): Promise<{success: boolean; posts: any[]}> {
  logSection('Testing GET /posts endpoint');
  let posts: any[] = [];

  try {
    // Test with default parameters
    logInfo('Sending GET request with default parameters...');

    logDebug(`Request URL: ${API_BASE_URL}${ENDPOINTS.POSTS}`);
    logDebug(`Headers: { 'x-api-key': '${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}' }`);

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.POSTS}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    logDebug(`Response status: ${response.status}`);
    const data = await response.json();
    logDebug(`Response data (default): ${JSON.stringify(data, null, 2)}`);

    if (response.ok) {
      logSuccess(`GET request successful (Status: ${response.status})`);
      logInfo(`Retrieved ${data.posts?.length ?? 0} posts`);
      posts = data.posts || [];

      // Log pagination info
      if (data.pagination) {
        logInfo(`Pagination: ${JSON.stringify(data.pagination)}`);
      }
    } else {
      logError(`GET request failed (Status: ${response.status})`);
      logError(`Error: ${data.message || JSON.stringify(data)}`);
    }

    // Test with query parameters
    logInfo('\nSending GET request with query parameters (limit=5, offset=0)...');
    const queryUrl = `${API_BASE_URL}${ENDPOINTS.POSTS}?limit=5&offset=0`;
    logDebug(`Request URL: ${queryUrl}`);

    const paramsResponse = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    logDebug(`Response status: ${paramsResponse.status}`);
    const paramsData = await paramsResponse.json();
    logDebug(`Response data (params): ${JSON.stringify(paramsData, null, 2)}`);

    if (paramsResponse.ok) {
      logSuccess(`GET request with parameters successful (Status: ${paramsResponse.status})`);
      logInfo(`Retrieved ${paramsData.posts?.length ?? 0} posts with limit=5`);
    } else {
      logError(`GET request with parameters failed (Status: ${paramsResponse.status})`);
      logError(`Error: ${paramsData.message || JSON.stringify(paramsData)}`);
    }

    // Overall success requires both requests to be okay in this test structure
    return { success: response.ok && paramsResponse.ok, posts };
  } catch (error) {
    logError(
      `Exception during GET /posts test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Error details: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
    return { success: false, posts };
  }
}

// Test GET request for a single post
async function testGetSinglePost(apiKey: string, slug: string): Promise<boolean> {
  logSection(`Testing GET /posts/${slug} endpoint`);

  if (!slug) {
      logError('Cannot test GET single post without a valid slug.');
      return false;
  }

  try {
    logInfo(`Sending GET request for post with slug: ${slug}...`);
    const url = `${API_BASE_URL}${ENDPOINTS.POSTS}/${slug}`;
    logDebug(`Request URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    logDebug(`Response status: ${response.status}`);
    const data = await response.json();
    logDebug(`Response data: ${JSON.stringify(data, null, 2)}`);

    if (response.ok) {
      logSuccess(`GET request for single post successful (Status: ${response.status})`);
      if (data.post) {
        logInfo(`Post title: ${data.post.title}`);
        logInfo(`Post slug: ${data.post.slug}`);
        logInfo(`Post category: ${data.post.category}`);
      } else {
        logWarning('Response OK but no post data found in the response.');
      }
    } else {
      logError(`GET request for single post failed (Status: ${response.status})`);
      logError(`Error: ${data.message || JSON.stringify(data)}`);
    }

    return response.ok;
  } catch (error) {
    logError(
      `Exception during GET /posts/${slug} test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Error details: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
    return false;
  }
}

// Test GET request for listing users
async function testGetUsers(apiKey: string): Promise<{success: boolean; users: any[]}> {
  logSection('Testing GET /users endpoint');
  let users: any[] = [];

  try {
    logInfo('Sending GET request to list users...');
    const url = `${API_BASE_URL}${ENDPOINTS.USERS}`;
    logDebug(`Request URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    logDebug(`Response status: ${response.status}`);
    const data = await response.json();
    logDebug(`Response data: ${JSON.stringify(data, null, 2)}`);

    if (response.ok) {
      logSuccess(`GET /users request successful (Status: ${response.status})`);
      logInfo(`Retrieved ${data.users?.length ?? 0} users`);
      users = data.users || [];

      if (users.length > 0) {
        // Log first user (sample data)
        logInfo(`Sample user data: ${JSON.stringify(users[0])}`);
      }
    } else {
      logError(`GET /users request failed (Status: ${response.status})`);
      logError(`Error: ${data.message || JSON.stringify(data)}`);
    }

    return { success: response.ok, users };
  } catch (error) {
    logError(
      `Exception during GET /users test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Error details: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
    return { success: false, users };
  }
}

// Test POST request for creating a post
async function testPostCreation(apiKey: string, users: any[], posts: any[], associatedUserId?: number): Promise<{ success: boolean; slug: string | null }> {
  logSection('Testing POST /posts endpoint');

  try {
    logInfo('Preparing post creation request...');

    // Get valid categories from existing posts or use a default one
    let validCategory = 'General'; // Default fallback
    if (posts && posts.length > 0) {
      const categories = new Set<string>();
      posts.forEach(post => {
        if (post.category) {
          categories.add(post.category);
        }
      });

      if (categories.size > 0) {
        validCategory = Array.from(categories)[0];
        logInfo(`Using existing category: "${validCategory}" from sample post`);
      } else {
        logInfo(`No categories found in existing posts. Using default: "${validCategory}"`);
      }
    } else {
        logInfo(`No existing posts found. Using default category: "${validCategory}"`);
    }

    // Log information about the user associated with the API key if provided
    if (associatedUserId !== undefined && !isNaN(associatedUserId)) {
      const matchingUser = users.find(user => user.id === associatedUserId);
      if (matchingUser) {
        logInfo(`API key is expected to be associated with user: ${matchingUser.username} (ID: ${associatedUserId})`);
        logInfo(`The API should automatically assign this user as the author.`);
      } else {
        logWarning(`Provided user ID ${associatedUserId} was not found in the fetched user list.`);
        logWarning(`Ensure the API key belongs to a valid user in the database.`);
      }
    } else {
        logInfo('No specific user ID provided for validation. Ensure the API key belongs to a valid user.');
    }

    logInfo('Authentication will use the x-api-key header.');

    // Prepare the post data
    const now = new Date();
    const timestamp = now.toISOString();
    const testPost = {
      title: `Test Post - ${timestamp}`,
      excerpt: 'This is a test post created by the API testing script.',
      category: validCategory,
      content: `This is the content of the test post generated at ${now.toLocaleTimeString()}. It was automatically created by the API testing script.`,
      featured: false,
      date: timestamp, // API expects 'date' (ISO format)
      // authorId is NOT included - API determines it from the key
    };

    logInfo('\nSending POST request to create a new post...');
    logInfo(`Post data: ${JSON.stringify(testPost)}`);
    const url = `${API_BASE_URL}${ENDPOINTS.POSTS}`;
    logDebug(`Request URL: ${url}`);
    logDebug(`Headers: { 'x-api-key': '***', 'Content-Type': 'application/json' }`); // Don't log full key in debug

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPost),
    });

    logDebug(`Response status: ${response.status}`);
    let data: any = {}; // Initialize data

    try {
        // Try to parse JSON, but handle potential errors if response is not JSON
        const responseText = await response.text();
        logDebug(`Raw response body: ${responseText}`);
        if (responseText) {
             data = JSON.parse(responseText);
             logDebug(`Parsed response data: ${JSON.stringify(data, null, 2)}`);
        } else {
             logDebug('Response body is empty.');
        }

    } catch (parseError) {
        logError(`Error parsing JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        // Log the status code even if parsing failed
        logError(`POST request failed with status: ${response.status}`);
        return { success: false, slug: null };
    }

    // Check response status *after* attempting to parse
    if (response.ok) {
        logSuccess(`POST request successful (Status: ${response.status})`);
        const createdPostId = data.id ?? data.post?.id ?? 'unknown';
        const createdPostSlug = data.slug ?? data.post?.slug ?? null;
        logSuccess(`Post created with ID: ${createdPostId}`);

        if (createdPostSlug) {
            logInfo(`Post created with slug: ${createdPostSlug}`);
            // Optionally test getting the created post immediately
            // await delay(1000); // Small delay for potential DB replication/indexing
            // await testGetSinglePost(apiKey, createdPostSlug); // Consider if this should affect the POST test result
            return { success: true, slug: createdPostSlug };
        } else {
            logWarning('Post created successfully, but no slug was returned in the response.');
            return { success: true, slug: null };
        }
    } else {
        // Handle errors based on status code and parsed data
        logError(`POST request failed (Status: ${response.status})`);
        const errorMessage = data.message || (typeof data.error === 'string' ? data.error : null) || JSON.stringify(data);
        logError(`Error: ${errorMessage}`);

        // Specific error checks
        if (response.status === 401) {
            logError('Authentication error: Your API key might be invalid or missing necessary permissions.');
            logError('Ensure the key is correctly sent in the \'x-api-key\' header.');
        } else if (response.status === 400 || response.status === 422) {
            logError('Bad Request / Unprocessable Entity: Check the post data payload.');
            // Check for common validation errors like null constraints
            const errorString = JSON.stringify(data).toLowerCase();
            if (errorString.includes('not null constraint') || errorString.includes('required')) {
                 logError('Possible cause: Missing required fields (e.g., title, content, category, date) or invalid data format.');
                 logError(`Sent data: ${JSON.stringify(testPost)}`);
            }
            if (data.error && typeof data.error === 'object') {
                logError(`Detailed validation errors: ${JSON.stringify(data.error)}`);
            }
        } else if (response.status === 500) {
            logError('Internal Server Error: The API encountered an issue.');
            logError('Possible causes:');
            logError('1. Database connection issue.');
            logError('2. Foreign key constraint violation (e.g., the user associated with the API key does not exist).');
            logError('3. Unexpected error in the API handler.');
        }
        return { success: false, slug: null };
    }

  } catch (error) {
    logError(
      `Exception during POST /posts test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Error details: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
    return { success: false, slug: null };
  }
}


// Test PUT request for updating a post
async function testPostUpdate(apiKey: string, slug: string): Promise<boolean> {
  logSection(`Testing PUT /posts/${slug} endpoint`);

  if (!slug) {
      logError('Cannot test PUT update without a valid slug from a created post.');
      return false;
  }

  const updateData = {
    title: `Updated Test Post - ${new Date().toISOString()}`,
    excerpt: 'This post excerpt was updated by the API testing script',
    featured: true,
    // Intentionally not updating category or content to test partial updates
  };

  try {
    logInfo(`Sending PUT request to update post with slug: ${slug}...`);
    logInfo(`Update data: ${JSON.stringify(updateData)}`);
    const url = `${API_BASE_URL}${ENDPOINTS.POSTS}/${slug}`;
    logDebug(`Request URL: ${url}`);
    logDebug(`Headers: { 'x-api-key': '***', 'Content-Type': 'application/json' }`);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    logDebug(`Response status: ${response.status}`);
    let data: any = {};

    try {
        // Try parsing JSON, handle errors
        const responseText = await response.text();
        logDebug(`Raw response body: ${responseText}`);
        if(responseText){
            data = JSON.parse(responseText);
            logDebug(`Parsed response data: ${JSON.stringify(data, null, 2)}`);
        } else {
            logDebug('Response body is empty.');
        }

    } catch (parseError) {
        logError(`Error parsing JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        logError(`PUT request failed with status: ${response.status}`);
        return false; // Parsing error means failure
    }

    // Check status after parsing attempt
    if (response.ok) {
      logSuccess(`PUT request successful (Status: ${response.status})`);
      const updatedPost = data.post ?? data; // Response structure might vary
      if (updatedPost && typeof updatedPost === 'object' && Object.keys(updatedPost).length > 0) {
          logInfo(`Updated post details (partial): Title='${updatedPost.title}', Featured='${updatedPost.featured}'`);
          logDebug(`Full updated post response: ${JSON.stringify(updatedPost)}`);

          // Verification step (optional but recommended)
          if (updatedPost.title !== updateData.title || updatedPost.featured !== updateData.featured) {
              logWarning('Verification Warning: Response data does not fully match update data.');
          }

      } else {
          logWarning('PUT request successful, but response data seems empty or malformed.');
      }
    } else {
      logError(`PUT request failed (Status: ${response.status})`);
      const errorMessage = data.message || JSON.stringify(data);
      logError(`Error: ${errorMessage}`);
      if (response.status === 404) {
          logError(`Possible cause: The post with slug "${slug}" was not found (maybe deleted or slug changed).`);
      } else if (response.status === 401) {
          logError('Authentication error: Check API key and permissions.');
      } else if (response.status === 400 || response.status === 422) {
          logError('Bad Request / Unprocessable Entity: Check the update data payload.');
      }
    }

    return response.ok;
  } catch (error) {
    logError(
      `Exception during PUT /posts/${slug} test: ${error instanceof Error ? error.message : String(error)}`,
    );
    logDebug(`Error details: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
    return false;
  }
}

// Main function
async function main() {
  console.log(chalk.bold.blue('\n🔑 API TESTING SCRIPT 🔑\n'));

  try {
    // Configure API base URL
    const customApiUrl = await prompt(`Enter API base URL (default: ${DEFAULT_API_BASE_URL}): `);
    if (customApiUrl.trim()) {
      API_BASE_URL = customApiUrl.trim();
    }

    logInfo(`Using API Base URL: ${chalk.yellow(API_BASE_URL)}`);
    if (API_BASE_URL !== DEFAULT_API_BASE_URL) {
        logWarning('Make sure this custom URL is correct!');
    }


    // Ask about debug mode
    const debugResponse = await prompt('Enable debug mode for detailed logs? (y/N): ');
    DEBUG_MODE = debugResponse.trim().toLowerCase() === 'y';
    if (DEBUG_MODE) {
        logInfo('Debug mode enabled.');
    }

    // Get API key from user
    const apiKey = await prompt('Please enter your API key: ');

    if (!apiKey) {
      logError('No API key provided. Exiting...');
      rl.close(); // Close readline before exiting
      return;
    }

    const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '***';
    logInfo(`Using API key: ${maskedKey}`);

    // Important information about authentication (based on script assumptions)
    logSection('Authentication Assumptions');
    logInfo('This script assumes:');
    logInfo('1. The API uses the `x-api-key` header for authentication.');
    logInfo('2. Each API key is associated with a user in the backend.');
    logInfo('3. The API automatically determines the author for new posts based on the key.');

    // Attempt to get associated user ID for validation/context
    let userId: number | undefined = undefined;
    let fetchedUsers: any[] = []; // Store users fetched here

    const userIdInput = await prompt('Optional: Enter the user ID associated with this API key (for validation, leave blank to skip): ');
    if (userIdInput.trim()) {
        const parsedId = parseInt(userIdInput, 10);
        if (!isNaN(parsedId)) {
            userId = parsedId;
            logInfo(`Will attempt to validate against user ID: ${userId}`);
        } else {
            logWarning('Invalid user ID entered. Skipping user ID validation.');
        }
    } else {
        logInfo('No specific user ID provided. Skipping validation.');
    }

    // Check connectivity *before* running intensive tests
    const serverConnected = await checkServerConnectivity();
    if (!serverConnected) {
      const proceed = await prompt('Server connectivity check failed. Proceed with tests anyway? (y/N): ');
      if (proceed.trim().toLowerCase() !== 'y') {
        logInfo('Exiting test script...');
        rl.close();
        return;
      }
      logWarning('Proceeding despite connectivity issues...');
    }

    // Get which tests to run
    const testsToRunInput = await prompt(
      'Which tests to run? (all, posts, users - comma-separated or "all"): '
    ).then(res => res.toLowerCase().trim());

    const runAll = !testsToRunInput || testsToRunInput === 'all';
    const runPosts = runAll || testsToRunInput.includes('posts');
    const runUsers = runAll || testsToRunInput.includes('users');

    if (!runPosts && !runUsers) {
        logWarning('No valid test types selected (choose from "all", "posts", "users"). Exiting.');
        rl.close();
        return;
    }

    logInfo(`Selected tests: ${runAll ? 'all' : testsToRunInput}`);
    logInfo('Starting API tests...');
    await delay(500); // Small delay

    // --- Test Execution ---
    const results: Record<string, boolean | string> = {}; // Use string for status like 'SKIPPED'
    let posts: any[] = [];
    let users: any[] = []; // Renamed from fetchedUsers for clarity in test calls

    // Fetch Users if needed for Users test OR Posts test (to get author info/validate key)
    if (runUsers || runPosts) {
        logInfo('Fetching initial user data...');
        const usersResult = await testGetUsers(apiKey);
        // Store result status, but always try to use fetched users if available
        results['GET /users (Initial Fetch)'] = usersResult.success;
        users = usersResult.users;

        // Validate provided userId against fetched list if applicable
        if (userId !== undefined && users.length > 0) {
            const matchingUser = users.find(u => u.id === userId);
            if (!matchingUser) {
                logWarning(`Provided user ID ${userId} was NOT found in the list fetched via GET /users.`);
                logInfo('Available user IDs: ' + users.map(u => u.id).join(', '));
            } else {
                logSuccess(`Provided user ID ${userId} (${matchingUser.username}) found in fetched list.`);
            }
        } else if (userId !== undefined && !usersResult.success) {
            logWarning('Could not fetch user list to validate the provided user ID.');
        }
    } else {
        results['GET /users'] = 'SKIPPED';
    }

    // Run Posts tests if selected
    if (runPosts) {
      // Test GET /posts endpoint
      const postsResult = await testGetPosts(apiKey);
      results['GET /posts'] = postsResult.success;
      posts = postsResult.posts; // Store posts for potential use in POST test
      await delay(500);

      // Test POST /posts endpoint
      // Pass fetched users, posts, and the optional userId for context
      const postCreateResult = await testPostCreation(apiKey, users, posts, userId);
      results['POST /posts'] = postCreateResult.success;
      const createdSlug = postCreateResult.slug; // Get slug for next tests
      await delay(500);

      // Test GET /posts/:slug for the *newly created* post (if successful)
      if (postCreateResult.success && createdSlug) {
          results[`GET /posts/${createdSlug} (Created Post)`] = await testGetSinglePost(apiKey, createdSlug);
          await delay(500);
      } else if (postCreateResult.success && !createdSlug) {
          results['GET /posts/:slug (Created Post)'] = 'SKIPPED (No slug returned)';
      } else {
          results['GET /posts/:slug (Created Post)'] = 'SKIPPED (Creation failed)';
      }


      // Test PUT /posts/:slug for the *newly created* post (if successful)
      if (postCreateResult.success && createdSlug) {
        results[`PUT /posts/${createdSlug}`] = await testPostUpdate(apiKey, createdSlug);
        await delay(500);

         // Optional: Test GET again after PUT to verify update persistence
         results[`GET /posts/${createdSlug} (After Update)`] = await testGetSinglePost(apiKey, createdSlug);
         await delay(500);

      } else {
        results['PUT /posts/:slug'] = 'SKIPPED (Creation failed or no slug)';
        results['GET /posts/:slug (After Update)'] = 'SKIPPED';
      }

       // Test GET /posts/:slug for an *existing* post (if any exist)
      if (posts.length > 0 && posts[0].slug) {
          const existingSlug = posts[0].slug;
          logInfo(`\nTesting GET for an existing post (slug: ${existingSlug})...`);
          results[`GET /posts/${existingSlug} (Existing Post)`] = await testGetSinglePost(apiKey, existingSlug);
          await delay(500);
      } else {
           results['GET /posts/:slug (Existing Post)'] = 'SKIPPED (No existing posts found)';
      }


    } else {
        results['GET /posts'] = 'SKIPPED';
        results['POST /posts'] = 'SKIPPED';
        results['GET /posts/:slug (Created Post)'] = 'SKIPPED';
        results['PUT /posts/:slug'] = 'SKIPPED';
        results['GET /posts/:slug (After Update)'] = 'SKIPPED';
        results['GET /posts/:slug (Existing Post)'] = 'SKIPPED';
    }


    // --- Summary ---
    logSection('Test Results Summary');

    let allPassed = true;
    let testsRunCount = 0;
    let testsFailedCount = 0;
    let testsSkippedCount = 0;

    Object.entries(results).forEach(([endpoint, result]) => {
      if (result === true) {
        logSuccess(`${endpoint}: PASSED`);
        testsRunCount++;
      } else if (result === false) {
        logError(`${endpoint}: FAILED`);
        allPassed = false;
        testsRunCount++;
        testsFailedCount++;
      } else {
        logWarning(`${endpoint}: ${result}`); // e.g., SKIPPED
        testsSkippedCount++;
      }
    });

    console.log('\n---');
    if (testsRunCount === 0 && testsSkippedCount > 0) {
         logWarning('No tests were executed.');
    } else if (allPassed) {
      logSuccess(`✨ All ${testsRunCount} executed tests passed! ✨`);
    } else {
      logWarning(`⚠️ ${testsFailedCount} out of ${testsRunCount} executed tests failed. Please review logs. ⚠️`);
    }
    if (testsSkippedCount > 0) {
        logInfo(`${testsSkippedCount} tests were skipped.`);
    }
    console.log('---');

  } catch (error) {
    logError(`An unexpected error occurred in the main script: ${error instanceof Error ? error.message : String(error)}`);
    if (DEBUG_MODE && error instanceof Error) {
      logDebug(`Error stack trace: ${error.stack}`);
    }
  } finally {
    // Clean up
    rl.close();
  }
}

// Run the script
main().catch((error) => {
  console.error(chalk.redBright('\n💥 Unhandled critical error in main execution:'), error);
  process.exit(1);
});
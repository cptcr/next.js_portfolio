#!/usr/bin/env tsx
/**
 * API Testing Script
 *
 * This script tests the API endpoints for the posts route.
 * It prompts the user for an API key and then tests both
 * GET and POST requests to validate the API functionality.
 *
 * Usage: npm run test_api
 */

import readline from 'readline';
import chalk from 'chalk';
import { setTimeout } from 'timers/promises';

// Constants
const API_BASE_URL = 'http://localhost:3001/api/v1';
console.log(
  chalk.red(
    `API_BASE_URL is set to ${API_BASE_URL} make sure to change it if your app is running on another domain and/or port!`,
  ),
);
const ENDPOINTS = {
  POSTS: '/posts',
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
const logInfo = (message: string) => console.log(chalk.blue(`ℹ️ ${message}`));
const logSuccess = (message: string) => console.log(chalk.green(`✅ ${message}`));
const logError = (message: string) => console.log(chalk.red(`❌ ${message}`));
const logWarning = (message: string) => console.log(chalk.yellow(`⚠️ ${message}`));
const logSection = (message: string) => console.log(chalk.magenta(`\n📋 ${message}`));

// Test GET request for listing posts
async function testGetPosts(apiKey: string) {
  logSection('Testing GET /posts endpoint');

  try {
    // Test with default parameters
    logInfo('Sending GET request with default parameters...');
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.POSTS}`, {
      method: 'GET',
      headers: {
        'x-api-key': `${apiKey}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      logSuccess(`GET request successful (Status: ${response.status})`);
      logInfo(`Retrieved ${data.posts?.length || 0} posts`);

      // Log pagination info
      if (data.pagination) {
        logInfo(`Pagination: ${JSON.stringify(data.pagination)}`);
      }
    } else {
      logError(`GET request failed (Status: ${response.status})`);
      logError(`Error: ${data.message || JSON.stringify(data)}`);
    }

    // Test with query parameters
    logInfo('\nSending GET request with query parameters...');
    const paramsResponse = await fetch(`${API_BASE_URL}${ENDPOINTS.POSTS}?limit=5&offset=0`, {
      method: 'GET',
      headers: {
        'x-api-key': `${apiKey}`,
      },
    });

    const paramsData = await paramsResponse.json();

    if (paramsResponse.ok) {
      logSuccess(`GET request with parameters successful (Status: ${paramsResponse.status})`);
      logInfo(`Retrieved ${paramsData.posts?.length || 0} posts with limit=5`);
    } else {
      logError(`GET request with parameters failed (Status: ${paramsResponse.status})`);
      logError(`Error: ${paramsData.message || JSON.stringify(paramsData)}`);
    }

    return response.ok && paramsResponse.ok;
  } catch (error) {
    logError(
      `Exception during GET test: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

// Test POST request for creating a post
async function testPostCreation(apiKey: string) {
  logSection('Testing POST /posts endpoint');

  const testPost = {
    title: `Test Post - ${new Date().toISOString()}`,
    excerpt: 'This is a test post created by the API testing script',
    category: 'test',
    content:
      'This is the content of the test post. It was automatically created by the API testing script.',
    featured: false,
  };

  try {
    logInfo('Sending POST request to create a new post...');
    logInfo(`Post data: ${JSON.stringify(testPost)}`);

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.POSTS}`, {
      method: 'POST',
      headers: {
        'x-api-key': `${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPost),
    });

    const data = await response.json();

    if (response.ok) {
      logSuccess(`POST request successful (Status: ${response.status})`);
      logSuccess(`Post created with ID: ${data.post?.id || 'unknown'}`);

      if (data.post) {
        logInfo(`Created post details: ${JSON.stringify(data.post)}`);
      }
    } else {
      logError(`POST request failed (Status: ${response.status})`);
      logError(`Error: ${data.message || JSON.stringify(data)}`);
    }

    return response.ok;
  } catch (error) {
    logError(
      `Exception during POST test: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

// Main function
async function main() {
  console.log(chalk.bold('\n🔑 API TESTING SCRIPT 🔑\n'));

  try {
    // Get API key from user
    const apiKey = await prompt('Please enter your API key: ');

    if (!apiKey) {
      logError('No API key provided. Exiting...');
      return;
    }

    logInfo(`Using API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    // Test the API
    logInfo('Starting API tests...');
    await setTimeout(1000); // Small delay for readability

    // Test GET endpoint
    const getSuccess = await testGetPosts(apiKey);

    // Add a small delay between tests
    await setTimeout(1000);

    // Test POST endpoint
    const postSuccess = await testPostCreation(apiKey);

    // Summary
    logSection('Test Results Summary');
    if (getSuccess) {
      logSuccess('GET /posts endpoint: PASSED');
    } else {
      logError('GET /posts endpoint: FAILED');
    }

    if (postSuccess) {
      logSuccess('POST /posts endpoint: PASSED');
    } else {
      logError('POST /posts endpoint: FAILED');
    }

    if (getSuccess && postSuccess) {
      logSuccess('\nAll tests passed successfully! ✨');
    } else {
      logWarning('\nSome tests failed. Please check the logs above for details.');
    }
  } catch (error) {
    logError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up
    rl.close();
  }
}

// Run the script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

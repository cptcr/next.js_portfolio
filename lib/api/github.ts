// lib/api/github.ts
import { Octokit } from "octokit";
// Types
export interface GithubStats {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  updatedAt: string;
  language?: string;
}

export interface GithubActivityItem {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  createdAt: string;
  payload?: any;
  commits?: any[];
  branch?: string;
  action?: string;
  number?: number;
  title?: string;
  refType?: string;
  ref?: string;
  head?: string;
}

export interface GithubContributions {
  totalContributions: number;
  lastYear: number;
  streak: number;
  contributionsByMonth: {
    month: string;
    count: number;
  }[];
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface ContributionDay {
  date: string;
  count: number;
}

// Initialize Octokit with token if available
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

// Cache mechanism
const cache = new Map<string, CacheItem<any>>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch with retry and exponential backoff to handle rate limits
 * @param fetchFn - The async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelay - Initial delay in ms before first retry (default: 1000)
 * @returns The result of the fetch function
 */
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (GitHub API returns 403 for rate limits)
      const isRateLimit = error.status === 403 || 
                         (error.message && error.message.includes('rate limit'));
                         
      // If it's the last attempt or not a rate limit issue, throw the error
      if (attempt === maxRetries || !isRateLimit) {
        throw error;
      }
      
      // Calculate delay with exponential backoff: initialDelay * 2^attempt
      delay = initialDelay * Math.pow(2, attempt);
      
      // Add some jitter to prevent all clients retrying at the same time
      const jitter = Math.random() * 0.3 * delay;
      
      console.log(`GitHub API rate limited. Retrying in ${Math.round((delay + jitter) / 1000)}s...`);
      
      // Wait before the next attempt
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  // This should never be reached due to the throw in the loop, but TypeScript wants it
  throw lastError;
}

async function getCachedData<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
  const cachedItem = cache.get(cacheKey);
  
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data as T;
  }
  
  // Implement exponential backoff for rate limits
  const data = await fetchWithRetry(fetchFn);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

/**
 * Get repository stats
 */
export async function getRepositoryStats(repoName: string): Promise<GithubStats> {
  return getCachedData<GithubStats>(`repo-stats-${repoName}`, async () => {
    try {
      const [owner, repo] = repoName.split('/');
      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });
      
      return {
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0,
        watchers: data.watchers_count || 0,
        openIssues: data.open_issues_count || 0,
        updatedAt: data.updated_at || new Date().toISOString(),
        language: data.language || undefined,
      };
    } catch (error) {
      console.error(`Error fetching repository stats for ${repoName}:`, error);
      // Return default values as fallback
      return {
        stars: 0,
        forks: 0,
        watchers: 0,
        openIssues: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  });
}

/**
 * Get user activity
 */
export async function getUserActivity(username: string, limit = 10): Promise<GithubActivityItem[]> {
  return getCachedData<GithubActivityItem[]>(`user-activity-${username}-${limit}`, async () => {
    try {
      const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100, // Get maximum allowed to filter from
      });
      
      // Filter for most interesting events
      const relevantEvents = events.filter((event: any) => 
        ['PushEvent', 'PullRequestEvent', 'CreateEvent', 'IssuesEvent'].includes(event.type || '')
      );
      
      // Process and format events
      const processedEvents = relevantEvents.slice(0, limit).map((event: any): GithubActivityItem => {
        const processed: GithubActivityItem = {
          id: event.id || '',
          type: event.type || '',
          repo: {
            name: event.repo?.name || '',
            url: `https://github.com/${event.repo?.name || ''}`,
          },
          createdAt: event.created_at || '',
        };
        
        // Process based on event type
        if (event.type === 'PushEvent' && event.payload) {
          processed.commits = event.payload.commits || [];
          processed.branch = event.payload.ref?.replace('refs/heads/', '') || '';
          processed.head = event.payload.head || '';
        } 
        else if (event.type === 'PullRequestEvent' && event.payload) {
          processed.action = event.payload.action || '';
          processed.number = event.payload.pull_request?.number;
          processed.title = event.payload.pull_request?.title || '';
        }
        else if (event.type === 'CreateEvent' && event.payload) {
          processed.refType = event.payload.ref_type || '';
          processed.ref = event.payload.ref || '';
        }
        else if (event.type === 'IssuesEvent' && event.payload) {
          processed.action = event.payload.action || '';
          processed.number = event.payload.issue?.number;
          processed.title = event.payload.issue?.title || '';
        }
        
        return processed;
      });
      
      return processedEvents;
    } catch (error) {
      console.error(`Error fetching user activity for ${username}:`, error);
      return [];
    }
  });
}

/**
 * Get user contributions (with fallback strategy)
 */
export async function getUserContributions(username: string): Promise<GithubContributions> {
  return getCachedData<GithubContributions>(`user-contributions-${username}`, async () => {
    try {
      // First try with GraphQL (requires token)
      if (process.env.GITHUB_TOKEN) {
        const query = `
          query {
            user(login: "${username}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
              }
            }
          }
        `;
        
        const response: any = await octokit.graphql(query);
        const calendar = response.user.contributionsCollection.contributionCalendar;
        
        // Process the data
        const contributions: ContributionDay[] = calendar.weeks.flatMap((week: any) =>
          week.contributionDays.map((day: any) => ({
            date: day.date,
            count: day.contributionCount,
          }))
        );
        
        // Calculate streak
        let streak = 0;
        let currentStreak = 0;
        const sortedDays = [...contributions].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        for (const day of sortedDays) {
          if (day.count > 0) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        streak = currentStreak;
        
        // Group by month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const contributionsByMonth = monthNames.map(month => ({ month, count: 0 }));
        
        for (const contribution of contributions) {
          const date = new Date(contribution.date);
          const monthIndex = date.getMonth();
          contributionsByMonth[monthIndex].count += contribution.count;
        }
        
        return {
          totalContributions: calendar.totalContributions,
          lastYear: calendar.totalContributions,
          streak,
          contributionsByMonth,
        };
      }
      
      // Fallback to REST API if no token or GraphQL fails
      throw new Error('No GitHub token or GraphQL failed, falling back to REST API');
    } catch (error) {
      console.log('Falling back to REST API for contributions');
      
      // Fallback using REST API
      try {
        const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
          username,
          per_page: 100,
        });
        
        // Count push events as contributions
        const pushEvents = events.filter((event: any) => event.type === 'PushEvent');
        
        // Count total commits
        const totalContributions = pushEvents.reduce((total: number, event: any) => {
          return total + ((event.payload?.commits?.length) || 0);
        }, 0);
        
        // Monthly contributions
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const contributionsByMonth = monthNames.map(month => ({ month, count: 0 }));
        
        // Calculate streak
        const contributionDates = new Set<string>();
        pushEvents.forEach((event: any) => {
          if (event.created_at) {
            const date = new Date(event.created_at);
            const monthIndex = date.getMonth();
            contributionsByMonth[monthIndex].count += (event.payload?.commits?.length || 0);
            
            contributionDates.add(date.toISOString().split('T')[0]);
          }
        });
        
        const sortedDates = Array.from(contributionDates).sort().reverse();
        let streak = 0;
        
        if (sortedDates.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const latestContribution = sortedDates[0];
          
          if (today === latestContribution) {
            streak = 1;
            
            // Check consecutive days
            const oneDayMillis = 24 * 60 * 60 * 1000;
            let currentDate = new Date(today);
            
            for (let i = 1; i < sortedDates.length; i++) {
              currentDate = new Date(currentDate.getTime() - oneDayMillis);
              const dateString = currentDate.toISOString().split('T')[0];
              
              if (sortedDates.includes(dateString)) {
                streak++;
              } else {
                break;
              }
            }
          }
        }
        
        return {
          totalContributions,
          lastYear: totalContributions,
          streak,
          contributionsByMonth,
        };
      } catch (secondError) {
        console.error('Error in fallback contributions:', secondError);
        
        // Return empty data structure if everything fails
        return {
          totalContributions: 0,
          lastYear: 0,
          streak: 0,
          contributionsByMonth: Array(12).fill(0).map((_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            count: 0,
          })),
        };
      }
    }
  });
}

/**
 * Get user's repositories
 */
export async function getUserRepositories(username: string, limit = 10): Promise<any[]> {
  return getCachedData<any[]>(`user-repos-${username}-${limit}`, async () => {
    try {
      const { data } = await octokit.rest.repos.listForUser({
        username,
        sort: 'updated',
        per_page: limit,
      });
      
      return data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || `Repository for ${repo.name}`,
        url: repo.html_url,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || 'N/A',
        updatedAt: repo.updated_at,
      }));
    } catch (error) {
      console.error(`Error fetching repositories for ${username}:`, error);
      return [];
    }
  });
}
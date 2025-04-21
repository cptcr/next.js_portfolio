import { NextResponse } from 'next/server';

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

interface GithubCache {
  data: any;
  timestamp: number;
}

let githubProjectCache: Record<string, GithubCache> = {};
let githubContributionsCache: GithubCache | null = null;
let githubReposCache: GithubCache | null = null;
let githubActivityCache: GithubCache | null = null;

/**
 * Fetches GitHub data with authentication if tokens are provided
 */
async function fetchFromGithub(url: string, useAuth = true) {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  // Add authentication if GitHub token is available and useAuth is true
  if (useAuth && process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const error = await res.json(); // Potential issue here if res.json() fails
    console.error(`GitHub API Error at ${url}:`, error);
    throw new Error(`Failed to fetch GitHub data: ${res.status} - ${error?.message || res.statusText}`);
  }
  return await res.json(); // And here
}

/**
 * Route handler for /api/github
 * Handles requests for project, activity, contributions, and repos
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const username = searchParams.get('username');
  const repo = searchParams.get('repo');

  try {
    if (type === 'activity' && username) {
      return getActivity(username);
    } else if (type === 'project' && repo) {
      return getProjectData(repo);
    } else if (type === 'contributions' && username) {
      return getContributions(username);
    } else if (type === 'repos' && username) {
      return getRepositories(username);
    } else {
      return NextResponse.json({ error: 'Invalid or missing parameters' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in /api/github:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

/**
 * Fetches GitHub repo data for a specific project
 */
async function getProjectData(repo: string) {
  // Serve from cache if available and valid
  const cached = githubProjectCache[repo];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetchFromGithub(`https://api.github.com/repos/${repo}`);

    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.message || `GitHub API returned ${response.status}`);
    }

    const repoData = await response.json();

    const projectData = {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || `Repository for ${repoData.name}`,
      url: repoData.html_url,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      issues: repoData.open_issues_count,
      language: repoData.language || 'N/A',
      license: repoData.license?.spdx_id || 'None',
      topics: repoData.topics || [],
      updatedAt: repoData.updated_at,
      createdAt: repoData.created_at,
    };

    // Cache the data
    githubProjectCache[repo] = {
      data: projectData,
      timestamp: Date.now(),
    };

    return NextResponse.json(projectData);
  } catch (error: any) {
    console.error('Error fetching GitHub project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub project' },
      { status: 500 }
    );
  }
}

/**
 * Fetches contributions data for a GitHub user using the GitHub GraphQL API
 */
async function getContributions(username: string) {
  // Return cached data if available and not expired
  if (
    githubContributionsCache &&
    Date.now() - githubContributionsCache.timestamp < CACHE_DURATION
  ) {
    return NextResponse.json(githubContributionsCache.data);
  }

  try {
    // Use GitHub GraphQL API to fetch contribution data
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

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${process.env.GITHUB_TOKEN || ''}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub GraphQL API returned ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const calendar = result.data.user.contributionsCollection.contributionCalendar;

    // Process the data to get monthly contributions
    const contributions = calendar.weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );

    // Group by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const contributionsByMonth: { month: string; count: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const monthContributions = contributions.filter((day: any) => {
        const date = new Date(day.date);
        return date.getMonth() === i;
      });

      const count = monthContributions.reduce((sum: number, day: any) => sum + day.count, 0);

      contributionsByMonth.push({
        month: monthNames[i],
        count,
      });
    }

    // Calculate streak (consecutive days with contributions)
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

    // Prepare response data
    const contributionsData = {
      totalContributions: calendar.totalContributions,
      lastYear: calendar.totalContributions,
      streak,
      contributionsByMonth,
    };

    // Cache the data
    githubContributionsCache = {
      data: contributionsData,
      timestamp: Date.now(),
    };

    return NextResponse.json(contributionsData);
  } catch (error: any) {
    console.error('Error fetching GitHub contributions:', error);
    // Since the GraphQL API requires authentication, fallback to basic data
    return await fallbackContributions(username);
  }
}

/**
 * Fallback method to get basic contribution data when GraphQL API fails
 */
async function fallbackContributions(username: string) {
  try {
    // Fetch user events as a basic approximation
    const response = await fetchFromGithub(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      true // Use authentication for this fallback as well, if possible
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const events = await response.json();

    // Count push events as contributions
    const pushEvents = events.filter((event: any) => event.type === 'PushEvent');

    // Count total commits across all push events
    const totalContributions = pushEvents.reduce((total: number, event: any) => {
      return total + (event.payload.commits?.length || 0);
    }, 0);

    // Group by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const contributionsByMonth: { month: string; count: number }[] = Array(12).fill(0).map((_, i) => ({
      month: monthNames[i],
      count: 0,
    }));

    // Populate with available data
    pushEvents.forEach((event: any) => {
      const date = new Date(event.created_at);
      const monthIndex = date.getMonth();
      contributionsByMonth[monthIndex].count += event.payload.commits?.length || 0;
    });

    // Calculate streak (consecutive days with contributions)
    // This is a simplified version since we only have the latest 100 events
    const contributionDates = new Set<string>();
    pushEvents.forEach((event: any) => {
      const date = new Date(event.created_at);
      contributionDates.add(date.toISOString().split('T')[0]);
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

    const contributionsData = {
      totalContributions,
      lastYear: totalContributions,
      streak,
      contributionsByMonth,
    };

    // Cache the data
    githubContributionsCache = {
      data: contributionsData,
      timestamp: Date.now(),
    };

    return NextResponse.json(contributionsData);
  } catch (error: any) {
    console.error('Error in fallback contributions:', error);

    // Return empty data structure if everything fails
    return NextResponse.json({
      totalContributions: 0,
      lastYear: 0,
      streak: 0,
      contributionsByMonth: Array(12).fill(0).map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        count: 0,
      })),
    });
  }
}

/**
 * Route handler for /api/github/activity
 * Returns recent activity data for a specific user
 */
export async function GETActivity(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" parameter in query' },
      { status: 400 }
    );
  }

  return getActivity(username);
}

/**
 * Fetches and processes recent activity data for a GitHub user for the last 30 days.
 */
async function getActivity(username: string) {
  // Return cached data if available and not expired
  if (
    githubActivityCache &&
    Date.now() - githubActivityCache.timestamp < CACHE_DURATION
  ) {
    // Check if the cached data is still within the last 30 days (simplified check)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (githubActivityCache.timestamp > thirtyDaysAgo) {
      return NextResponse.json(githubActivityCache.data);
    }
  }

  try {
    // Fetch activity from GitHub API for all public events (we'll filter later)
    const events = await fetchFromGithub(
      `https://api.github.com/users/${username}/events/public?per_page=100` // Increased per_page to get more events to filter from
    );

    if (!events) {
      console.error('GitHub API Error (getActivity - last 30 days): fetchFromGithub failed');
      return NextResponse.json([], { status: 500, statusText: 'Failed to fetch activity data' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filter events to include only those created in the last 30 days
    const recentEvents = events.filter((event: any) => {
      const createdAt = new Date(event.created_at);
      return createdAt >= thirtyDaysAgo;
    });

    // Transform the recent events data
    const activityData = recentEvents.map((event: any) => {
      return {
        id: event.id,
        type: event.type,
        repo: {
          name: event.repo.name,
          url: `https://github.com/${event.repo.name}`,
        },
        createdAt: event.created_at,
        payload: event.payload,
      };
    });

    // Cache the data
    githubActivityCache = {
      data: activityData,
      timestamp: Date.now(),
    };

    return NextResponse.json(activityData);

  } catch (error: any) {
    console.error('Error fetching GitHub activity (last 30 days):', error);
    return NextResponse.json([]);
  }
}

/**
 * Fetches repository data for a GitHub user
 */
async function getRepositories(username: string) {
  // Return cached data if available and not expired
  if (
    githubReposCache &&
    Date.now() - githubReposCache.timestamp < CACHE_DURATION
  ) {
    return NextResponse.json(githubReposCache.data);
  }

  try {
    // Fetch repositories from GitHub API
    const repos = await fetchFromGithub(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`
    );

    if (!repos) { // Check if fetchFromGithub returned null or undefined on error
      console.error('GitHub API Error (getRepositories): fetchFromGithub failed');
      return NextResponse.json({ error: 'Failed to fetch GitHub repositories' }, { status: 500 });
    }

    // Transform data to only include what we need
    const reposData = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || `Repository for ${repo.name}`,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || 'N/A',
      updatedAt: repo.updated_at,
    }));

    // Cache the data
    githubReposCache = {
      data: reposData,
      timestamp: Date.now(),
    };

    return NextResponse.json(reposData);

  } catch (error: any) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories' },
      { status: 500 }
    );
  }
}
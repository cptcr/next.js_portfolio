// app/api/github/route.ts

import { NextResponse } from 'next/server';
import { 
  getRepositoryStats, 
  getUserActivity, 
  getUserContributions, 
  getUserRepositories 
} from '@/lib/api/github';

/**
 * Route handler for /api/github
 * Handles requests for project, activity, contributions, and repos
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const username = searchParams.get('username');
  const repo = searchParams.get('repo');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

  try {
    if (type === 'activity' && username) {
      const data = await getUserActivity(username, limit);
      return NextResponse.json(data);
    } else if (type === 'project' && repo) {
      const data = await getRepositoryStats(repo);
      return NextResponse.json(data);
    } else if (type === 'contributions' && username) {
      const data = await getUserContributions(username);
      return NextResponse.json(data);
    } else if (type === 'repos' && username) {
      const data = await getUserRepositories(username, limit);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Invalid or missing parameters' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in /api/github:', error);
    return NextResponse.json({ error: 'Failed to process request', message: error.message }, { status: 500 });
  }
}
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, GitCommit, GitPullRequest, GitMerge, GitBranch, FileCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { timeAgo } from "@/lib/utils/helpers"

interface ActivityItem {
  id: string
  type: string
  repo: {
    name: string
    url: string
  }
  createdAt: string
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

interface GithubActivityProps {
  username?: string; // Make username optional here if you hardcode it below
  limit?: number
}

export default function GithubActivity({ username = "cptcr", limit = 5 }: GithubActivityProps) {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true)
        setError(null)

        const accessToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const headers: HeadersInit = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/github?type=activity&username=${username}`, {
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData?.error || "Failed to fetch GitHub activity";
          throw new Error(errorMessage);
        }

        const data = await response.json() as ActivityItem[];
        // The backend should now be filtering for PRs and pushes and limiting to 5
        setActivity(data);
      } catch (err: any) {
        console.error("Error fetching GitHub activity:", err);
        setError(err.message || "Could not load GitHub activity. Please try again later.");
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [username, limit])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (activity.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No recent GitHub PRs or pushes found for {username}.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activity.map((item) => (
        <ActivityCard key={item.id} activity={item} />
      ))}

      <div className="text-center mt-8">
        <Button asChild variant="outline">
          <Link
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View More on GitHub
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  let icon = <GitCommit className="h-5 w-5 text-primary" />;
  let title = "Activity";
  let description = "";
  let linkHref = activity.repo.url;

  switch (activity.type) {
    case "PushEvent":
      icon = <GitCommit className="h-5 w-5 text-green-500" />;
      title = `Pushed to ${activity.repo.name.split('/')[1]}`;
      description = `${activity.commits?.length || 0} commit${activity.commits?.length !== 1 ? 's' : ''} to ${activity.branch}`;
      linkHref = activity.repo.url + `/commits/${activity.head}`;
      break;

    case "PullRequestEvent":
      linkHref = activity.payload?.pull_request?.html_url || activity.repo.url;
      if (activity.action === "opened") {
        icon = <GitPullRequest className="h-5 w-5 text-purple-500" />;
        title = `Opened PR #${activity.payload?.number} in ${activity.repo.name.split('/')[1]}`;
      } else if (activity.action === "closed" && activity.payload?.pull_request?.merged) {
        icon = <GitMerge className="h-5 w-5 text-indigo-500" />;
        title = `Merged PR #${activity.payload?.number} in ${activity.repo.name.split('/')[1]}`;
      } else if (activity.action === "closed") {
        icon = <GitPullRequest className="h-5 w-5 text-red-500" />;
        title = `Closed PR #${activity.payload?.number} in ${activity.repo.name.split('/')[1]}`;
      } else {
        icon = <GitPullRequest className="h-5 w-5 text-yellow-500" />;
        title = `Updated PR #${activity.payload?.number} in ${activity.repo.name.split('/')[1]}`;
      }
      description = activity.payload?.pull_request?.title || "Pull request";
      break;
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium truncate">
                <Link
                  href={linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {title}
                </Link>
              </h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {timeAgo(activity.createdAt)}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-1 truncate">
              {description}
            </p>

            <div className="mt-2">
              <Link
                href={activity.repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-primary hover:underline"
              >
                <GitBranch className="h-3 w-3 mr-1" />
                {activity.repo.name}
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
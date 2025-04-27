"use client"

import { useState, useEffect, SetStateAction } from "react"
import { Loader2, GitBranch, Star, GitFork, Calendar, History } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { timeAgo } from "@/lib/utils/helpers"

interface ContributionsData {
  totalContributions: number
  lastYear: number
  streak: number
  contributionsByMonth: {
    month: string
    count: number
  }[]
}

interface RepoData {
  id: number
  name: string
  description: string
  url: string
  stars: number
  forks: number
  language: string
  updatedAt: string
}

interface ActivityData {
  id: string
  type: string
  repo: {
    name: string
    url: string
  }
  createdAt: string
  [key: string]: any
}

interface GithubContributionsProps {
  username: string
}

export default function GithubContributions({ username }: GithubContributionsProps) {
  const [activeTab, setActiveTab] = useState("contributions")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [contributionsData, setContributionsData] = useState<ContributionsData | null>(null)
  const [reposData, setReposData] = useState<RepoData[] | null>(null)
  const [activityData, setActivityData] = useState<ActivityData[] | null>(null)
  
  useEffect(() => {
    const fetchGithubData = async (type: string) => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/github?type=${type}&username=${username}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch GitHub ${type}`)
        }
        
        const data = await response.json()
        
        switch (type) {
          case 'contributions':
            setContributionsData(data)
            break
          case 'repos':
            setReposData(data)
            break
          case 'activity':
            setActivityData(data)
            break
        }
      } catch (err) {
        console.error(`Error fetching GitHub ${type}:`, err)
        setError(`Could not load GitHub ${type}. Please try again later.`)
      } finally {
        setLoading(false)
      }
    }
    
    // Fetch data based on active tab
    fetchGithubData(activeTab)
  }, [activeTab, username])
  
  return (
    <div className="overflow-hidden border rounded-lg bg-card border-border">
      <Tabs 
        defaultValue="contributions" 
        value={activeTab}
        onValueChange={(value: SetStateAction<string>) => setActiveTab(value)}
        className="w-full"
      >
        <div className="border-b border-border">
          <TabsList className="justify-start w-full p-0 rounded-none bg-card">
            <TabsTrigger 
              value="contributions" 
              className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none py-3 px-4"
            >
              Contributions
            </TabsTrigger>
            <TabsTrigger 
              value="repos" 
              className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none py-3 px-4"
            >
              Repositories
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none py-3 px-4"
            >
              Recent Activity
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <TabsContent value="contributions" className="mt-0">
                {contributionsData && <ContributionsTab data={contributionsData} />}
              </TabsContent>
              
              <TabsContent value="repos" className="mt-0">
                {reposData && <RepositoriesTab data={reposData} />}
              </TabsContent>
              
              <TabsContent value="activity" className="mt-0">
                {activityData && <ActivityTab data={activityData} />}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  )
}

function ContributionsTab({ data }: { data: ContributionsData }) {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-background">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">{data.totalContributions}</div>
            <CardDescription>All-time contributions</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-background">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Last 12 Months</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">{data.lastYear}</div>
            <CardDescription>Contributions this year</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-background">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Current Streak</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">{data.streak} days</div>
            <CardDescription>Daily contribution streak</CardDescription>
          </CardContent>
        </Card>
      </div>
      
      {/* Contributions Chart */}
      <div className="p-4 border rounded-lg bg-background border-border">
        <h3 className="mb-4 text-lg font-medium">Contributions by Month</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.contributionsByMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280" }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240 10% 3.9%)",
                  borderColor: "hsl(240 3.7% 15.9%)",
                  color: "hsl(0 0% 98%)",
                }}
              />
              <Bar 
                dataKey="count" 
                name="Contributions" 
                fill="hsl(210 100% 50%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function RepositoriesTab({ data }: { data: RepoData[] }) {
  return (
    <div className="space-y-4">
      <h3 className="mb-2 text-lg font-medium">Latest Repositories</h3>
      <div className="divide-y divide-border">
        {data.length > 0 ? (
          data.map((repo) => (
            <div key={repo.id} className="py-4">
              <a 
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-lg font-medium text-primary hover:underline"
              >
                {repo.name}
              </a>
              
              {repo.description && (
                <p className="mt-1 text-muted-foreground">{repo.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                {repo.language && (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    <span>{repo.language}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  <span>{repo.stars}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" />
                  <span>{repo.forks}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <History className="h-3.5 w-3.5" />
                  <span>Updated {timeAgo(repo.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="py-4 text-muted-foreground">No repositories found.</p>
        )}
      </div>
    </div>
  )
}

function ActivityTab({ data }: { data: ActivityData[] }) {
  return (
    <div className="space-y-4">
      <h3 className="mb-2 text-lg font-medium">Recent Activity</h3>
      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg bg-background border-border">
              <ActivityEvent event={event} />
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No recent activity found.</p>
        )}
      </div>
    </div>
  )
}

function ActivityEvent({ event }: { event: ActivityData }) {
  let icon = null
  let title = ""
  let details = null
  
  switch (event.type) {
    case 'PushEvent':
      icon = <GitBranch className="w-5 h-5 text-green-500" />
      title = `Pushed ${event.commits} commits to ${event.repo.name}`
      details = <p className="text-sm text-muted-foreground">Branch: {event.branch}</p>
      break
      
    case 'PullRequestEvent':
      icon = <GitBranch className="w-5 h-5 text-purple-500" />
      title = `${event.action === 'opened' ? 'Opened' : 'Updated'} pull request #${event.number} in ${event.repo.name}`
      details = <p className="text-sm text-muted-foreground">{event.title}</p>
      break
      
    case 'IssuesEvent':
      icon = <GitBranch className="w-5 h-5 text-yellow-500" />
      title = `${event.action === 'opened' ? 'Opened' : event.action} issue #${event.number} in ${event.repo.name}`
      details = <p className="text-sm text-muted-foreground">{event.title}</p>
      break
      
    case 'CreateEvent':
      icon = <GitBranch className="w-5 h-5 text-blue-500" />
      title = `Created ${event.refType} ${event.ref || ''} in ${event.repo.name}`
      break
      
    default:
      icon = <GitBranch className="w-5 h-5" />
      title = `Activity in ${event.repo.name}`
  }
  
  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {icon}
        </div>
        <div className="flex-1">
          <a 
            href={event.repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:text-primary"
          >
            {title}
          </a>
          
          {details}
          
          <p className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {timeAgo(event.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
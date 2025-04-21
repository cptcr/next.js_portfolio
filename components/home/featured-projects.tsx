"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Github, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/helpers"

interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  githubUrl: string
  demoUrl?: string
  featured: boolean
  repoName: string // GitHub repository name for fetching stats
}

interface ProjectWithStats extends Project {
  stats?: {
    stars: number
    forks: number
    watchers: number
    openIssues: number
    updatedAt: string
    language?: string
  }
  loading: boolean
  error?: string
}

// Project base data - we'll enhance this with real-time stats from GitHub
const PROJECTS: Project[] = [
  {
    id: "nexus",
    title: "Nexus",
    description: "An advanced Discord.js Bot/Client Handler that simplifies the development of robust Discord bots through a structured and feature-rich framework.",
    tags: ["Bot", "Discord", "Framework"],
    githubUrl: "https://github.com/cptcr/Nexus",
    featured: true,
    repoName: "cptcr/Nexus"
  },
  {
    id: "macro-api",
    title: "macro_api",
    description: "A lightweight wrapper library that simplifies API integration with standardized error handling and caching.",
    tags: ["Library", "API", "Integration"],
    githubUrl: "https://github.com/cptcr/macro_api",
    featured: true,
    repoName: "cptcr/macro_api"
  },
  {
    id: "paymenter-api",
    title: "PaymenterAPI",
    description: "A Node.js API wrapper for interacting with the Paymenter API, providing an easy-to-use interface for managing tickets, invoices, and other related features.",
    tags: ["API", "Payment", "Gateway"],
    githubUrl: "https://github.com/cptcr/PaymenterAPI",
    featured: true,
    repoName: "cptcr/PaymenterAPI"
  },
  {
    id: "pterodactyl-api-wrapper",
    title: "Pterodactyl API Wrapper",
    description: "A fully-featured Node.js API wrapper for the Pterodactyl panel, allowing management of users, servers, nodes, and more.",
    tags: ["API", "Gaming", "Server Management"],
    githubUrl: "https://github.com/cptcr/pterodactyl-api-wrapper",
    featured: false,
    repoName: "cptcr/pterodactyl-api-wrapper"
  },
  {
    id: "discord-development",
    title: "Discord Development",
    description: "A repository containing all Discord bot projects, providing resources and documentation for building and managing Discord bots.",
    tags: ["Discord", "Bot", "Collection"],
    githubUrl: "https://github.com/cptcr/discord-development",
    featured: false,
    repoName: "cptcr/discord-development"
  }
]

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<ProjectWithStats[]>(
    PROJECTS.map(project => ({ ...project, loading: true }))
  )
  
  useEffect(() => {
  const fetchProjectData = async () => {
    const updatedProjects = await Promise.all(
      PROJECTS.map(async (project) => {
        try {
          const response = await fetch(`https://api.github.com/repos/${project.repoName}`)
          if (!response.ok) throw new Error(`GitHub API returned ${response.status}`)

          const data = await response.json()

          return {
            ...project,
            loading: false,
            stats: {
              stars: data.stargazers_count,
              forks: data.forks_count,
              watchers: data.watchers_count,
              openIssues: data.open_issues_count,
              updatedAt: data.updated_at,
              language: data.language
            }
          }
        } catch (error) {
          console.error(`Error fetching GitHub data for ${project.title}:`, error)
          return {
            ...project,
            loading: false,
            error: 'Failed to load project stats'
          }
        }
      })
    )

    setProjects(updatedProjects)
  }

  fetchProjectData()
}, [])

  
  // Filter to show only the top 3 featured projects
  const featuredProjects = projects
    .filter(project => project.featured)
    .slice(0, 3)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProjects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  )
}

function ProjectCard({ project }: { project: ProjectWithStats }) {
  const [isHovered, setIsHovered] = useState(false)
  const { stats, loading, error } = project
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  return (
    <Card 
      className={cn(
        "h-full flex flex-col transition-all duration-300 hover:shadow-lg cursor-glow border-border/50 overflow-hidden",
        isHovered && "border-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold tracking-tight flex items-center justify-between gap-2">
          <span>{project.title}</span>
          {!loading && !error && stats && (
            <div className="flex items-center text-sm font-normal">
              <Github className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">{stats.stars}</span>
            </div>
          )}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.tags.map(tag => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-3">
        <p className="text-muted-foreground text-sm mb-4">
          {project.description}
        </p>
        
        {/* Real-time GitHub Stats */}
        <div className="mt-auto">
          {loading ? (
            <div className="flex items-center justify-center p-2 rounded-md bg-muted/30">
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
              <span className="text-xs text-muted-foreground">Loading stats...</span>
            </div>
          ) : error ? (
            <div className="flex items-center p-2 rounded-md bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-xs text-muted-foreground">{error}</span>
            </div>
          ) : stats ? (
            <div className="rounded-md bg-muted/30 p-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">GitHub Stats:</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-medium">{stats.stars}</div>
                  <div className="text-xs text-muted-foreground">Stars</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{stats.forks}</div>
                  <div className="text-xs text-muted-foreground">Forks</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{stats.openIssues}</div>
                  <div className="text-xs text-muted-foreground">Issues</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                <div>{stats.language || 'N/A'}</div>
                <div>Updated: {formatDate(stats.updatedAt)}</div>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          
          {project.demoUrl && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Live Demo</span>
              </Link>
            </Button>
          )}
        </div>
        
        <Button asChild variant="link" className="p-0 h-auto">
          <Link href={`/projects#${project.id}`}>
            View Details <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
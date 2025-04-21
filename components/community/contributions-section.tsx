"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { GitPullRequest, Star, GitFork, ArrowRight, File, Bug } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Contribution {
  repo: string
  repoUrl: string
  description: string
  contributionType: "pull-request" | "issue" | "feature" | "documentation"
  contributionDescription: string
  date: string
}

const CONTRIBUTIONS: Contribution[] = [
  {
    repo: "expressjs/express",
    repoUrl: "https://github.com/expressjs/express",
    description: "Fast, unopinionated, minimalist web framework for Node.js",
    contributionType: "pull-request",
    contributionDescription: "Fixed a bug in the route handling system that caused specific edge cases to fail with URL parameters.",
    date: "2023-10-15"
  },
  {
    repo: "vercel/next.js",
    repoUrl: "https://github.com/vercel/next.js",
    description: "The React Framework for Production",
    contributionType: "documentation",
    contributionDescription: "Improved documentation for API routes with detailed examples and edge cases for handling different request methods.",
    date: "2023-09-22"
  },
  {
    repo: "prisma/prisma",
    repoUrl: "https://github.com/prisma/prisma",
    description: "Next-generation ORM for Node.js & TypeScript",
    contributionType: "issue",
    contributionDescription: "Reported and helped debug an issue with relation queries that affected performance in specific scenarios.",
    date: "2023-08-05"
  },
  {
    repo: "tailwindlabs/tailwindcss",
    repoUrl: "https://github.com/tailwindlabs/tailwindcss",
    description: "A utility-first CSS framework for rapid UI development",
    contributionType: "feature",
    contributionDescription: "Added support for a new animation variant that allows more control over animation timing and behavior.",
    date: "2023-07-18"
  },
]

export default function ContributionsSection() {
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null)
  
  // Toggle expanded state for a repo
  const toggleExpand = (repo: string) => {
    if (expandedRepo === repo) {
      setExpandedRepo(null)
    } else {
      setExpandedRepo(repo)
    }
  }
  
  return (
    <div className="space-y-8">
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
        I actively contribute to open source projects, focusing on improving documentation, 
        fixing bugs, and adding features to projects I use daily.
      </p>
      
      <div className="space-y-4">
        {CONTRIBUTIONS.map((contribution, index) => (
          <motion.div
            key={contribution.repo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  <Link 
                    href={contribution.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {contribution.repo}
                  </Link>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground mb-4">
                  {contribution.description}
                </p>
                
                <div className="bg-muted rounded-md p-4">
                  <div className="flex items-start gap-3">
                    {contribution.contributionType === "pull-request" && (
                      <GitPullRequest className="h-5 w-5 text-green-500 mt-0.5" />
                    )}
                    
                    {contribution.contributionType === "issue" && (
                      <Bug className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    
                    {contribution.contributionType === "documentation" && (
                      <File className="h-5 w-5 text-blue-500 mt-0.5" />
                    )}
                    
                    {contribution.contributionType === "feature" && (
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        {contribution.contributionType === "pull-request" && "Pull Request"}
                        {contribution.contributionType === "issue" && "Issue Report"}
                        {contribution.contributionType === "documentation" && "Documentation"}
                        {contribution.contributionType === "feature" && "Feature Addition"}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground">
                        {contribution.contributionDescription}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Contributed on {new Date(contribution.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <Button 
                    asChild 
                    variant="link" 
                    className="h-auto p-0 text-primary"
                  >
                    <Link 
                      href={contribution.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Repository <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          These are just a few examples of my open source contributions. 
          Check out my GitHub profile for more.
        </p>
        
        <Button asChild>
          <Link 
            href="https://github.com/cptcr" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View GitHub Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
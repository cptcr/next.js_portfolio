"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ExternalLink, Github, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CommunityProject {
  id: string
  title: string
  description: string
  role: string
  members: number
  url: string
  githubUrl?: string
}

const COMMUNITY_PROJECTS: CommunityProject[] = [
  {
    id: "dev-community-forum",
    title: "Dev Community Forum",
    description: "An online forum for developers to ask questions, share knowledge, and collaborate on projects. I help with backend development and community moderation.",
    role: "Backend Developer & Moderator",
    members: 2500,
    url: "https://devforum.example.com",
    githubUrl: "https://github.com/dev-community/forum",
  },
  {
    id: "coding-challenges",
    title: "Weekly Coding Challenges",
    description: "A community-driven initiative that creates weekly coding challenges for developers to practice their skills. I create backend challenges and review submissions.",
    role: "Challenge Creator & Reviewer",
    members: 850,
    url: "https://codingchallenges.example.com",
    githubUrl: "https://github.com/coding-challenges/weekly",
  },
  {
    id: "webdev-resources",
    title: "WebDev Resources",
    description: "A collaborative open-source repository of curated web development resources, tutorials, and tools. I contribute to the backend and API sections.",
    role: "Repository Maintainer",
    members: 1200,
    url: "https://webdevresources.example.com",
    githubUrl: "https://github.com/webdev-resources/collection",
  },
]

export default function CommunityProjects() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {COMMUNITY_PROJECTS.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{project.members.toLocaleString()} members</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm mb-4">
                {project.description}
              </p>
              
              <div className="bg-muted rounded-md p-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">My Role</h4>
                <p className="text-sm">{project.role}</p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                {project.githubUrl && (
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                  </Button>
                )}
                
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={project.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Website</span>
                  </Link>
                </Button>
              </div>
              
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href={project.url} target="_blank" rel="noopener noreferrer">
                  Visit Project <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
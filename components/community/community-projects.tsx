'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Github, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import COMMUNITY_PROJECTS from '@/config/community/community_projects';

export default function CommunityProjects() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {COMMUNITY_PROJECTS.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{project.members.toLocaleString()} members</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <p className="mb-4 text-sm text-muted-foreground">{project.description}</p>

              <div className="p-3 rounded-md bg-muted">
                <h4 className="mb-1 text-xs font-semibold tracking-wider uppercase">My Role</h4>
                <p className="text-sm">{project.role}</p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                {project.githubUrl && (
                  <Button asChild variant="ghost" size="icon" className="w-8 h-8">
                    <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                  </Button>
                )}

                <Button asChild variant="ghost" size="icon" className="w-8 h-8">
                  <Link href={project.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    <span className="sr-only">Website</span>
                  </Link>
                </Button>
              </div>

              <Button asChild variant="link" className="h-auto p-0">
                <Link href={project.url} target="_blank" rel="noopener noreferrer">
                  Visit Project <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

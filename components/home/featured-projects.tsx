'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Github, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';
import PROJECTS from '@/config/home/projects';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  demoUrl?: string;
  featured: boolean;
  repoName: string; // GitHub repository name for fetching stats
}

interface ProjectWithStats extends Project {
  stats?: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    updatedAt: string;
    language?: string;
  };
  loading: boolean;
  error?: string;
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<ProjectWithStats[]>(
    PROJECTS.map((project) => ({ ...project, loading: true })),
  );

  useEffect(() => {
    const fetchProjectData = async () => {
      const updatedProjects = await Promise.all(
        PROJECTS.map(async (project) => {
          try {
            const response = await fetch(`https://api.github.com/repos/${project.repoName}`);
            if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

            const data = await response.json();

            return {
              ...project,
              loading: false,
              stats: {
                stars: data.stargazers_count,
                forks: data.forks_count,
                watchers: data.watchers_count,
                openIssues: data.open_issues_count,
                updatedAt: data.updated_at,
                language: data.language,
              },
            };
          } catch (error) {
            console.error(`Error fetching GitHub data for ${project.title}:`, error);
            return {
              ...project,
              loading: false,
              error: 'Failed to load project stats',
            };
          }
        }),
      );

      setProjects(updatedProjects);
    };

    fetchProjectData();
  }, []);

  // Filter to show only the top 3 featured projects
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
  );
}

function ProjectCard({ project }: { project: ProjectWithStats }) {
  const [isHovered, setIsHovered] = useState(false);
  const { stats, loading, error } = project;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className={cn(
        'h-full flex flex-col transition-all duration-300 hover:shadow-lg cursor-glow border-border/50 overflow-hidden',
        isHovered && 'border-primary/50',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-xl font-bold tracking-tight">
          <span>{project.title}</span>
          {!loading && !error && stats && (
            <div className="flex items-center text-sm font-normal">
              <Github className="w-4 h-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{stats.stars}</span>
            </div>
          )}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.tags.map((tag) => (
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
        <p className="mb-4 text-sm text-muted-foreground">{project.description}</p>

        {/* Real-time GitHub Stats */}
        <div className="mt-auto">
          {loading ? (
            <div className="flex items-center justify-center p-2 rounded-md bg-muted/30">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading stats...</span>
            </div>
          ) : error ? (
            <div className="flex items-center p-2 rounded-md bg-red-500/10">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              <span className="text-xs text-muted-foreground">{error}</span>
            </div>
          ) : stats ? (
            <div className="p-2 rounded-md bg-muted/30">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">GitHub Stats:</h4>
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
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <div>{stats.language || 'N/A'}</div>
                <div>Updated: {formatDate(stats.updatedAt)}</div>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="w-8 h-8">
            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          {project.demoUrl && (
            <Button asChild variant="ghost" size="icon" className="w-8 h-8">
              <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                <span className="sr-only">Live Demo</span>
              </Link>
            </Button>
          )}
        </div>

        <Button asChild variant="link" className="h-auto p-0">
          <Link href={`/projects#${project.id}`}>
            View Details <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

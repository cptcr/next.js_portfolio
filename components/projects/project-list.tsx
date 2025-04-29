'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Code, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';

import PROJECT_BASE_DATA from '@/config/projects/project_list';

interface ProjectBase {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  techStack: string[];
  githubUrl: string;
  repoName: string;
  demoUrl?: string;
  featured: boolean;
}

interface Project extends ProjectBase {
  githubData?: {
    stars: number;
    forks: number;
    watchers: number;
    language?: string;
    updatedAt: string;
  };
  loading: boolean;
  error?: string;
}

// Filter options for projects
const ALL_TAGS = Array.from(new Set(PROJECT_BASE_DATA.flatMap((project) => project.tags)));

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>(
    PROJECT_BASE_DATA.map((project) => ({ ...project, loading: true })),
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Fetch GitHub data for all projects
  useEffect(() => {
    async function fetchGitHubData() {
      const updatedProjects = [...projects];

      for (let i = 0; i < updatedProjects.length; i++) {
        const project = updatedProjects[i];

        try {
          // Use GitHub API to fetch real repository data
          const response = await fetch(`https://api.github.com/repos/${project.repoName}`);

          if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
          }

          const data = await response.json();

          updatedProjects[i] = {
            ...project,
            loading: false,
            githubData: {
              stars: data.stargazers_count,
              forks: data.forks_count,
              watchers: data.watchers_count,
              language: data.language,
              updatedAt: data.updated_at,
            },
          };
        } catch (error) {
          console.error(`Error fetching GitHub data for ${project.title}:`, error);
          updatedProjects[i] = {
            ...project,
            loading: false,
            error: 'Failed to load GitHub data',
          };
        }
      }

      setProjects(updatedProjects);
    }

    fetchGitHubData();
  }, []);

  // Filter projects based on selected tag
  const filteredProjects = selectedTag
    ? projects.filter((project) => project.tags.includes(selectedTag))
    : projects;

  return (
    <div>
      {/* Filter Tags */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setSelectedTag(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm transition-colors',
            selectedTag === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-primary/20 text-foreground/70',
          )}
        >
          All Projects
        </button>

        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={cn(
              'px-4 py-2 rounded-full text-sm transition-colors',
              selectedTag === tag
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-primary/20 text-foreground/70',
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            id={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <ProjectCard
              project={project}
              expanded={expandedProject === project.id}
              onToggleExpand={() => {
                setExpandedProject(expandedProject === project.id ? null : project.id);
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  expanded: boolean;
  onToggleExpand: () => void;
}

function ProjectCard({ project, expanded, onToggleExpand }: ProjectCardProps) {
  const { githubData, loading, error } = project;

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
        'h-full flex flex-col border-border/50 overflow-hidden transition-all duration-300',
        expanded ? 'shadow-lg border-primary/50' : 'hover:shadow-md hover:border-primary/30',
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl font-bold tracking-tight">
          <span className="mr-2">{project.title}</span>
          <div className="flex-grow"></div>
          <div className="flex items-center">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : error ? (
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            ) : (
              <>
                <Github className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                <span className="text-sm font-normal text-muted-foreground">
                  {githubData?.stars || 0}
                </span>
              </>
            )}
          </div>
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

      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-muted-foreground">
          {expanded && project.longDescription ? project.longDescription : project.description}
        </p>

        {expanded && (
          <>
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-semibold">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {!loading && !error && githubData && (
              <div className="p-3 mt-4 rounded-md bg-muted/30">
                <h4 className="mb-2 text-xs font-semibold tracking-wider uppercase">
                  GitHub Stats
                </h4>

                <div className="grid grid-cols-3 text-center gap-x-2 gap-y-2">
                  <div>
                    <div className="text-sm font-medium">{githubData.stars}</div>
                    <div className="text-xs text-muted-foreground">Stars</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">{githubData.forks}</div>
                    <div className="text-xs text-muted-foreground">Forks</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">{githubData.watchers}</div>
                    <div className="text-xs text-muted-foreground">Watchers</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 text-xs border-t border-border text-muted-foreground">
                  <div>{githubData.language || 'N/A'}</div>
                  <div>Updated: {formatDate(githubData.updatedAt)}</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2">
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

        <Button variant="link" className="h-auto p-0" onClick={onToggleExpand}>
          {expanded ? 'Show Less' : 'Learn More'}
          <ArrowRight
            className={cn('ml-1 h-3 w-3 transition-transform', expanded && 'rotate-90')}
          />
        </Button>
      </CardFooter>
    </Card>
  );
}

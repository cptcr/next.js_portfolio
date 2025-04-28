'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Code, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';

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

// Base project data - we'll enhance this with real-time GitHub stats
const PROJECT_BASE_DATA: ProjectBase[] = [
  {
    id: 'nexus-discord-bot',
    title: 'Nexus',
    description:
      'An advanced Discord.js Bot/Client Handler that simplifies the development of robust Discord bots through a structured and feature-rich framework.',
    longDescription:
      'Nexus is an advanced Discord.js Bot/Client Handler that provides easy command and event handling, support for slash commands, developer-only guild commands, and database integration support for MongoDB, MySQL, and PostgreSQL.',
    tags: ['Bot', 'Discord', 'Framework'],
    techStack: ['TypeScript', 'Discord.js', 'Node.js'],
    githubUrl: 'https://github.com/cptcr/Nexus',
    repoName: 'cptcr/Nexus',
    featured: true,
  },
  {
    id: 'macro-api',
    title: 'macro_api',
    description:
      'A lightweight wrapper library that simplifies API integration with standardized error handling and caching.',
    longDescription:
      'macro_api is a TypeScript library designed to streamline API integrations. It provides developers with a standardized interface for making API requests with built-in error handling, response caching, and rate limiting. The library supports both REST APIs and GraphQL, and includes type-safe response parsing.',
    tags: ['Library', 'API', 'Integration'],
    techStack: ['TypeScript', 'Node.js', 'REST', 'GraphQL'],
    githubUrl: 'https://github.com/cptcr/macro_api',
    repoName: 'cptcr/macro_api',
    featured: true,
  },
  {
    id: 'paymenter-api',
    title: 'PaymenterAPI',
    description:
      'A Node.js API wrapper for interacting with the Paymenter API, providing an easy-to-use interface for managing tickets, invoices, and other related features.',
    longDescription:
      'PaymenterAPI is a Node.js wrapper for the Paymenter API that allows for managing tickets, invoices, and other features for both clients and admins. It supports both JavaScript and TypeScript, making it versatile for different project requirements.',
    tags: ['API', 'Payment', 'Integration'],
    techStack: ['TypeScript', 'Node.js', 'REST'],
    githubUrl: 'https://github.com/cptcr/PaymenterAPI',
    repoName: 'cptcr/PaymenterAPI',
    featured: false,
  },
  {
    id: 'pterodactyl-api-wrapper',
    title: 'Pterodactyl API Wrapper',
    description:
      'A fully-featured Node.js API wrapper for the Pterodactyl panel, allowing management of users, servers, nodes, and more.',
    longDescription:
      'This API wrapper for the Pterodactyl panel provides comprehensive functionality for managing servers, users, nodes, locations, databases, files, and more directly from Node.js projects. It supports both Client and Application APIs and includes WebSocket support for real-time interactions.',
    tags: ['API', 'Gaming', 'Server Management'],
    techStack: ['TypeScript', 'Node.js', 'REST', 'WebSocket'],
    githubUrl: 'https://github.com/cptcr/pterodactyl-api-wrapper',
    repoName: 'cptcr/pterodactyl-api-wrapper',
    featured: false,
  },
  {
    id: 'discord-development',
    title: 'Discord Development',
    description:
      'A repository containing all Discord bot projects, providing resources and documentation for building and managing Discord bots.',
    longDescription:
      'This repository serves as a comprehensive collection of Discord bot projects, offering valuable documentation and resources for bot development. It showcases different approaches to creating and managing Discord bots with various features and functionalities.',
    tags: ['Discord', 'Bot', 'Collection'],
    techStack: ['JavaScript', 'TypeScript', 'Discord.js'],
    githubUrl: 'https://github.com/cptcr/discord-development',
    repoName: 'cptcr/discord-development',
    featured: false,
  },
  {
    id: 'portfolio',
    title: 'Next.js Portfolio',
    description: 'Built with Next 15, React 19 and much much love.',
    tags: ['Next.js 15', 'TypeScript', 'TailwindCSS', 'React 19', 'ShadCN UI'],
    githubUrl: 'https://github.com/cptcr/next.js_portfolio',
    featured: true,
    repoName: 'cptcr/next.js_portfolio',
    techStack: ['TypeScript', 'Next.JS', 'TailwindCSS', 'React'],
  },
];

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

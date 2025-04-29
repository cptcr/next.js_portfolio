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

// Project base data - we'll enhance this with real-time stats from GitHub
const PROJECTS: Project[] = [
  {
    id: 'nexus',
    title: 'Nexus',
    description:
      'An advanced Discord.js Bot/Client Handler that simplifies the development of robust Discord bots through a structured and feature-rich framework.',
    tags: ['Discord', 'Framework'],
    githubUrl: 'https://github.com/cptcr/Nexus',
    featured: false,
    repoName: 'cptcr/Nexus',
  },
  {
    id: 'macro-api',
    title: 'macro_api',
    description:
      'A lightweight wrapper library that simplifies API integration with standardized error handling and caching.',
    tags: ['Library', 'API', 'Integration'],
    githubUrl: 'https://github.com/cptcr/macro_api',
    featured: true,
    repoName: 'cptcr/macro_api',
  },
  {
    id: 'paymenter-api',
    title: 'PaymenterAPI',
    description:
      'A Node.js API wrapper for interacting with the Paymenter API, providing an easy-to-use interface for managing tickets, invoices, and other related features.',
    tags: ['API', 'Gateway'],
    githubUrl: 'https://github.com/cptcr/paymenter-api',
    featured: true,
    repoName: 'cptcr/paymenter-api',
  },
  {
    id: 'pterodactyl-api-wrapper',
    title: 'Pterodactyl API Wrapper',
    description:
      'A fully-featured Node.js API wrapper for the Pterodactyl panel, allowing management of users, servers, nodes, and more.',
    tags: ['API', 'Server Management'],
    githubUrl: 'https://github.com/cptcr/pterodactyl-api-wrapper',
    featured: false,
    repoName: 'cptcr/pterodactyl-api-wrapper',
  },
  {
    id: 'discord-development',
    title: 'Discord Development',
    description:
      'A repository containing all Discord bot projects, providing resources and documentation for building and managing Discord bots.',
    tags: ['Collection'],
    githubUrl: 'https://github.com/cptcr/discord-development',
    featured: false,
    repoName: 'cptcr/discord-development',
  },
  {
    id: 'portfolio',
    title: 'Next.js Portfolio',
    description: '',
    tags: ['Next.js 15', 'TypeScript', 'TailwindCSS', 'React 19', 'ShadCN UI'],
    githubUrl: 'https://github.com/cptcr/next.js_portfolio',
    featured: true,
    repoName: 'cptcr/next.js_portfolio',
  },
];

export default PROJECTS;

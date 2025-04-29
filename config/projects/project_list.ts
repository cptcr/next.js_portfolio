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

export default PROJECT_BASE_DATA;

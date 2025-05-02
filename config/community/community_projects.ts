interface CommunityProject {
  id: string;
  title: string;
  description: string;
  role: string;
  members: number;
  url: string;
  githubUrl?: string;
}

const COMMUNITY_PROJECTS: CommunityProject[] = [
  {
    id: 'dev-community-forum',
    title: 'Dev Community Forum',
    description:
      'An online forum for developers to ask questions, share knowledge, and collaborate on projects. I help with backend development and community moderation.',
    role: 'Backend Developer & Moderator',
    members: 2500,
    url: 'https://devforum.example.com',
    githubUrl: 'https://github.com/dev-community/forum',
  },
  {
    id: 'coding-challenges',
    title: 'Weekly Coding Challenges',
    description:
      'A community-driven initiative that creates weekly coding challenges for developers to practice their skills. I create backend challenges and review submissions.',
    role: 'Challenge Creator & Reviewer',
    members: 850,
    url: 'https://codingchallenges.example.com',
    githubUrl: 'https://github.com/coding-challenges/weekly',
  },
  {
    id: 'webdev-resources',
    title: 'WebDev Resources',
    description:
      'A collaborative open-source repository of curated web development resources, tutorials, and tools. I contribute to the backend and API sections.',
    role: 'Repository Maintainer',
    members: 1200,
    url: 'https://webdevresources.example.com',
    githubUrl: 'https://github.com/webdev-resources/collection',
  },
];

export default COMMUNITY_PROJECTS;

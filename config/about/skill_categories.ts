type SkillCategory = {
  name: string;
  skills: {
    name: string;
    level: number; // 1-10
    color?: string;
  }[];
};

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Languages',
    skills: [
      { name: 'JavaScript', level: 9, color: '#f7df1e' },
      { name: 'TypeScript', level: 9, color: '#3178c6' },
      { name: 'HTML/CSS', level: 6, color: '#e34c26' },
      { name: 'C++', level: 2, color: '#00599c' },
      { name: 'Python', level: 1, color: '#3776ab' },
    ],
  },
  {
    name: 'Frontend',
    skills: [
      { name: 'React', level: 6, color: '#61dafb' },
      { name: 'Next.js', level: 5, color: '#000000' },
      { name: 'TailwindCSS', level: 6, color: '#06b6d4' },
      { name: 'ShadCN UI', level: 4, color: '#6366f1' },
    ],
  },
  {
    name: 'Backend & APIs',
    skills: [
      { name: 'Node.js', level: 10, color: '#339933' },
      { name: 'Express.js', level: 7, color: '#303030' },
      { name: 'Discord.js', level: 10, color: '#7289da' },
      { name: 'REST APIs', level: 8, color: '#4caf50' },
      { name: 'GraphQL', level: 3, color: '#e535ab' },
    ],
  },
  {
    name: 'DevOps & Infrastructure',
    skills: [
      { name: 'Docker', level: 4, color: '#2496ed' },
      { name: 'Vercel', level: 5, color: '#000000' },
      { name: 'AWS', level: 5, color: '#ff9900' },
      { name: 'Azure', level: 3, color: '#0078d4' },
      { name: 'Proxmox', level: 4, color: '#e57000' },
    ],
  },
  {
    name: 'Databases',
    skills: [
      { name: 'MongoDB', level: 5, color: '#47a248' },
      { name: 'Mongoose', level: 7, color: '#800000' },
      { name: 'Redis', level: 2, color: '#d82c20' },
      { name: 'Prisma', level: 1, color: '#0c344b' },
    ],
  },
  {
    name: 'Tools & Productivity',
    skills: [
      { name: 'Git', level: 8, color: '#f05032' },
      { name: 'MS 365', level: 6, color: '#d83b01' },
      { name: 'Figma', level: 1, color: '#f24e1e' },
      { name: 'VS Code', level: 6, color: '#007acc' },
    ],
  },
  {
    name: 'Operating Systems',
    skills: [
      { name: 'Windows 11', level: 9, color: '#00adef' },
      { name: 'Windows 10', level: 9, color: '#0078d7' },
      { name: 'Ubuntu 24', level: 6, color: '#e95420' },
      { name: 'Debian 12', level: 2, color: '#a80030' },
      { name: 'ParrotOS', level: 5, color: '#00bfff' },
    ],
  },
];

export default SKILL_CATEGORIES;
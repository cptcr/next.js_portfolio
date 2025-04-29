type TimelineEvent = {
  year: string;
  title: string;
  description: string;
};

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '2007',
    title: 'Birth',
    description: 'Another shitty developer was born (like the world doesnt have enough already)',
  },
  {
    year: '2018',
    title: 'Early Exploration',
    description:
      'Started my coding journey with simple HTML and CSS during school. Also began learning fundamental computer concepts, understanding basic hardware components and their functions.',
  },
  {
    year: '2020',
    title: 'First Backend & Bot Development',
    description:
      'Ventured into backend programming by creating Discord bots using discord.js and Node.js. Gained initial experience with databases (quick.db) and started learning about frameworks like discord.js and Sapphire. Simultaneously, school introduced me to the binary and hexadecimal systems and Microsoft 365.',
  },
  {
    year: '2021',
    title: 'Expanding Horizons',
    description:
      'Delved into the intricacies of sorting algorithms and began exploring frontend development with React, with initial touches in Vue.js. My technical landscape broadened with my first experience using Linux (Ubuntu) and C++ (through Arduino). This year also marked the beginning of creating REST APIs and understanding the principles and applications of domain names.',
  },
  {
    year: '2022',
    title: 'AI Introduction & Deeper Dive',
    description:
      "Had my first encounter with Artificial Intelligence through OpenAI's ChatGPT. In school, I experimented with Batch scripting for various 'testing' purposes. My understanding of Node.js and VS Code deepened significantly. I briefly explored Python but focused primarily on JavaScript for my immediate needs.",
  },
  {
    year: '2023',
    title: 'Server Management & Hosting',
    description:
      'Started managing hosting systems for Minecraft, websites, and other applications. Learned about Docker and Pterodactyl for efficient management of multiple server instances. Gained practical experience hosting websites and APIs on NGINX servers.',
  },
  {
    year: '2024',
    title: 'Modern Web & Cloud Technologies',
    description:
      'Focused on learning Next.js and TypeScript for building robust web applications. Explored virtualization with Proxmox and delved into subnet configuration. Created NPM packages to streamline API interactions with Paymenter and Pterodactyl. Gained initial experience with Microsoft Azure Database integration and Azure VMs, and used Vercel for hosting for the first time. Also learned cPanel setup for web hosting management.',
  },
  {
    year: '2025',
    title: 'Project Launches & Portfolio',
    description:
      'Successfully launched the Macro_API NPM package, providing a solution for streamlined API interactions. Also launched my personal portfolio website to showcase my skills and projects.',
  },
];

export default TIMELINE_EVENTS;

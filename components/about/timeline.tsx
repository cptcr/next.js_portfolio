'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils/helpers';

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

export default function Timeline() {
  return (
    <div className="relative">
      {/* Center line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border" />

      <div className="flex flex-col space-y-12">
        {TIMELINE_EVENTS.map((event, index) => (
          <TimelineItem key={index} event={event} index={index} />
        ))}
      </div>
    </div>
  );
}

interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
}

function TimelineItem({ event, index }: TimelineItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { once: true, amount: 0.2 });

  const isEven = index % 2 === 0;

  return (
    <div
      ref={itemRef}
      className={cn('relative flex', isEven ? 'justify-start md:justify-end' : 'justify-start')}
    >
      <motion.div
        className={cn('w-full md:w-5/12 bg-card rounded-lg p-6 border border-border relative z-10')}
        initial={{
          opacity: 0,
          x: isEven ? 50 : -50,
        }}
        animate={{
          opacity: isInView ? 1 : 0,
          x: isInView ? 0 : isEven ? 50 : -50,
        }}
        transition={{
          duration: 0.5,
          delay: 0.2,
        }}
      >
        {/* Year Badge */}
        <div className="absolute -top-4 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          {event.year}
        </div>

        <div className="mt-3">
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p className="text-muted-foreground mt-2">{event.description}</p>
        </div>

        {/* Connection dot */}
        <div
          className={cn(
            'absolute top-1/2 w-5 h-5 rounded-full bg-primary border-4 border-background',
            'transform -translate-y-1/2',
            isEven
              ? 'left-0 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-1/2'
              : 'left-0 -translate-x-1/2',
          )}
        />
      </motion.div>
    </div>
  );
}

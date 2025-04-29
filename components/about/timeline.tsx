'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils/helpers';
import TIMELINE_EVENTS from '@/config/about/timeline';

type TimelineEvent = {
  year: string;
  title: string;
  description: string;
};

export default function Timeline() {
  return (
    <div className="relative">
      {/* Center line */}
      <div className="absolute w-px h-full transform -translate-x-1/2 left-1/2 bg-border" />

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
        <div className="absolute px-4 py-1 text-sm font-medium rounded-full -top-4 bg-primary text-primary-foreground">
          {event.year}
        </div>

        <div className="mt-3">
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p className="mt-2 text-muted-foreground">{event.description}</p>
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

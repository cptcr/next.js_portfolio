'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/helpers';
import SKILL_CATEGORIES from '@/config/about/skill_categories';

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0].name);

  const currentCategory =
    SKILL_CATEGORIES.find((category) => category.name === activeCategory) || SKILL_CATEGORIES[0];

  return (
    <div className="skills-component">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {SKILL_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeCategory === category.name
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-primary/20 text-foreground/70',
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Skills Bars */}
      <div className="grid gap-4">
        {currentCategory.skills.map((skill) => (
          <div key={skill.name} className="skill-item">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{skill.name}</span>
              <span className="text-xs text-muted-foreground">{skill.level * 10}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${skill.level * 10}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  backgroundColor: skill.color || 'var(--primary)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

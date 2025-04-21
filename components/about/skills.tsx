"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/helpers"

type SkillCategory = {
  name: string
  skills: {
    name: string
    level: number // 1-10
    color?: string
  }[]
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Languages",
    skills: [
      { name: "JavaScript", level: 9, color: "#f7df1e" },
      { name: "TypeScript", level: 9, color: "#3178c6" },
      { name: "HTML/CSS", level: 6 },
      { name: "C++", level: 2, color: "#00599c" },
      { name: "Python", level: 1, color: "#3776ab" },
    ],
  },
  {
    name: "Frameworks & Libraries",
    skills: [
      { name: "Next.js", level: 5, color: "#000000" },
      { name: "React", level: 6, color: "#61dafb" },
      { name: "TailwindCSS", level: 6, color: "#06b6d4" },
      { name: "Node.js", level: 10, color: "#339933" },
      { name: "Express.js", level: 7 },
    ],
  },
  {
    name: "Tools & Platforms",
    skills: [
      { name: "Git", level: 8, color: "#f05032" },
      { name: "Docker", level: 4, color: "#2496ed" },
      { name: "Vercel", level: 5 },
      { name: "AWS", level: 5, color: "#ff9900" },
      { name: "MongoDB", level: 7, color: "#47a248" },
    ],
  },
]

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0].name)
  
  const currentCategory = SKILL_CATEGORIES.find(category => category.name === activeCategory) || SKILL_CATEGORIES[0]
  
  return (
    <div className="skills-component">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center mb-8 gap-2">
        {SKILL_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === category.name
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-primary/20 text-foreground/70"
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
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{skill.name}</span>
              <span className="text-xs text-muted-foreground">
                {skill.level * 10}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${skill.level * 10}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  backgroundColor: skill.color || "var(--primary)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
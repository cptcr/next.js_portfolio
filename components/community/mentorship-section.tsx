"use client"

import { motion } from "framer-motion"
import { BookOpen, Code, MessageSquare, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface MentorshipItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  stats: string
}

const MENTORSHIP_ITEMS: MentorshipItem[] = [
  {
    title: "Coding Help & Troubleshooting",
    description: "I regularly help developers troubleshoot their code, debug issues, and understand complex concepts in JavaScript, TypeScript, and Node.js.",
    icon: Code,
    stats: "500+ issues solved",
  },
  {
    title: "Learning Resources Creation",
    description: "I create tutorials, code snippets, and guides to help developers learn backend development, API integration, and modern web technologies.",
    icon: BookOpen,
    stats: "25+ tutorials created",
  },
  {
    title: "1-on-1 Mentoring",
    description: "I provide personalized mentoring to help developers improve their skills, work through challenges, and advance their careers.",
    icon: MessageSquare,
    stats: "30+ mentees guided",
  },
  {
    title: "Community Workshops",
    description: "I organize and lead workshops on backend development topics, helping developers learn new skills and technologies in a collaborative environment.",
    icon: Users,
    stats: "12+ workshops hosted",
  },
]

export default function MentorshipSection() {
  return (
    <div className="text-center space-y-8">
      <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
        I'm passionate about helping other developers grow. Here are some ways I contribute to the developer community through mentorship and knowledge sharing.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MENTORSHIP_ITEMS.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mx-auto bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
                
                <div className="text-sm font-medium text-primary">
                  {item.stats}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-muted rounded-lg p-6 text-left max-w-xl mx-auto mt-8">
        <h3 className="text-lg font-medium mb-3">Interested in Mentorship?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          If you're looking for help with backend development, API integration, or web technologies, I'd be happy to assist. Feel free to reach out through my contact page.
        </p>
        <p className="text-sm">
          <span className="font-medium">Areas I can help with:</span> JavaScript, TypeScript, Node.js, Next.js, React, API development, and database integration.
        </p>
      </div>
    </div>
  )
}
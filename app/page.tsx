import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import QuoteOfDay from "@/components/home/quote-of-day"
import FeaturedProjects from "@/components/home/featured-projects"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-screen overflow-hidden py-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50 z-10" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-accent/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        
        <div className="container px-4 relative z-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
              Hey, I'm <span className="text-primary">Tony</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              A 17-year-old backend developer passionate about creating efficient, 
              scalable applications with <span className="text-primary">Node.js</span>, 
              <span className="text-secondary"> TypeScript</span>, and
              <span className="text-accent"> Express</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/projects">
                  See My Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/contact">
                  Contact Me
                </Link>
              </Button>
            </div>
            
            {/* Quote of the Day */}
            <div className="mt-12 w-full max-w-md animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
              <QuoteOfDay />
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Projects Section */}
      <section className="py-24 bg-card">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-muted-foreground max-w-2xl">
              Check out some of my recent work. These projects showcase my skills in
              backend development, API integration, and modern web technologies.
            </p>
          </div>
          
          <FeaturedProjects />
          
          <div className="flex justify-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/projects">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Me Brief Section */}
      <section className="py-24">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                About Me
              </h2>
              <p className="text-muted-foreground mb-6">
                I'm a 17-year-old backend developer based near Stuttgart, Germany. 
                I've been programming since I was 14, and I've developed a strong 
                passion for creating efficient, scalable solutions using modern technologies.
              </p>
              <p className="text-muted-foreground mb-8">
                My tech stack includes JavaScript, TypeScript, Node.js, C++, SQL, and more. 
                I love contributing to open-source projects and helping others in the developer community.
              </p>
              <Button asChild>
                <Link href="/about">
                  Learn More About Me <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Interested in Collaborating?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              I'm always open to new opportunities and exciting projects.
              Let's build something amazing together.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
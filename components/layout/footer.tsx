"use client"

import Link from "next/link"
import { 
  Github, 
  Linkedin, 
  Twitter,
  Heart
} from "lucide-react"

const NAVIGATION_ITEMS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Community", href: "/community" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "https://github.com/cptcr",
    icon: Github,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/cptcr",
    icon: Twitter,
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card text-card-foreground mt-24">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Branding & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="text-xl font-bold font-heading text-primary">
                cptcr<span className="text-white">.</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              17-year-old backend developer from Stuttgart, Germany. Specializing in Next.js, TypeScript, and TailwindCSS.
            </p>
            <div className="flex mt-6 space-x-4">
              {SOCIAL_LINKS.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="mailto:contact@cptcr.dev" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  contact@cptcr.dev
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground order-2 md:order-1 mt-4 md:mt-0">
              © {currentYear} Tony (cptcr). All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center order-1 md:order-2">
              Built with <Heart className="h-4 w-4 mx-1 text-red-500" /> using Next.js, TypeScript & TailwindCSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/helpers"
import { 
  Menu, 
  X, 
  Github, 
  Linkedin, 
  Twitter
} from "lucide-react"
import { Button } from "@/components/ui/button"

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "https://github.com/cptcr",
    icon: Github,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/cptcrr",
    icon: Twitter,
  },
]

const NAVIGATION_ITEMS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Community", href: "/community" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-200",
        scrolled 
          ? "bg-background/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold font-heading text-primary">
            cptcr<span className="text-white">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/10"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Social Links - Desktop */}
        <div className="hidden md:flex items-center space-x-2">
          {SOCIAL_LINKS.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="icon"
              asChild
              aria-label={item.name}
              className="rounded-full hover:bg-primary/10 hover:text-primary"
            >
              <Link href={item.href} target="_blank" rel="noopener noreferrer">
                <item.icon className="h-5 w-5" />
              </Link>
            </Button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
          <div className="flex flex-col p-4 space-y-2">
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-3 text-base font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/10"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Social Links in Mobile Menu */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border mt-4">
              {SOCIAL_LINKS.map((item) => (
                <Button
                  key={item.name}
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-md"
                >
                  <Link 
                    href={item.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
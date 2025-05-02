'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter, Heart } from 'lucide-react';

const NAVIGATION_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Community', href: '/community' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    href: 'https://github.com/cptcr',
    icon: Github,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/cptcr',
    icon: Twitter,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-card text-card-foreground">
      <div className="container px-4 pt-16 pb-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Branding & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="text-xl font-bold font-heading text-primary">
                cptcr<span className="text-white">.</span>
              </span>
            </Link>
            <p className="max-w-xs mt-4 text-sm text-muted-foreground">
              17-year-old backend developer from Stuttgart, Germany. Specializing in Next.js,
              TypeScript, and TailwindCSS.
            </p>
            <div className="flex mt-6 space-x-4">
              {SOCIAL_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors text-muted-foreground hover:text-primary"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">Navigation</h3>
            <ul className="mt-4 space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors text-muted-foreground hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="mailto:contact@cptcr.dev"
                  className="text-sm transition-colors text-muted-foreground hover:text-primary"
                >
                  contact@cptcr.dev
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm transition-colors text-muted-foreground hover:text-primary"
                >
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="pt-8 mt-12 border-t border-border">
          <h3 className="text-sm font-semibold tracking-wider uppercase">Legal</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/legal/imprint"
                className="text-sm transition-colors text-muted-foreground hover:text-primary"
              >
                Imprint
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="text-sm transition-colors text-muted-foreground hover:text-primary"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/credits"
                className="text-sm transition-colors text-muted-foreground hover:text-primary"
              >
                Credits
              </Link>
            </li>
          </ul>
        </div>
        {/* Copyright */}
        <div className="pt-8 mt-12 border-t border-border">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="order-2 mt-4 text-sm text-muted-foreground md:order-1 md:mt-0">
              © {currentYear} Tony (cptcr). All rights reserved.
            </p>
            <p className="flex items-center order-1 text-sm text-muted-foreground md:order-2">
              Built with <Heart className="w-4 h-4 mx-1 text-red-500" /> using Next.js, TypeScript &
              TailwindCSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

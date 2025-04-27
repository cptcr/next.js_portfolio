// app/layout.tsx
import type { Metadata } from 'next'
import { Inter as FontSans, Space_Grotesk as FontHeading, JetBrains_Mono as FontMono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils/helpers'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Fonts configuration
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontHeading = FontHeading({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// SEO metadata
export const metadata: Metadata = {
  title: {
    default: 'Tony (cptcr) | Backend Developer',
    template: '%s | Tony (cptcr)'
  },
  description: '17-year-old backend developer specializing in Next.js, TypeScript, and TailwindCSS.',
  keywords: ['developer', 'backend', 'Next.js', 'TypeScript', 'TailwindCSS', 'Stuttgart', 'Germany'],
  authors: [{ name: 'Tony', url: 'https://github.com/cptcr' }],
  creator: 'Tony (cptcr)',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cptcr.dev',
    title: 'Tony (cptcr) | Backend Developer',
    description: '17-year-old backend developer specializing in Next.js, TypeScript, and TailwindCSS.',
    siteName: 'Tony (cptcr) | Backend Developer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tony (cptcr) | Backend Developer',
    description: '17-year-old backend developer specializing in Next.js, TypeScript, and TailwindCSS.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL("http://localhost:3000")
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        fontSans.variable,
        fontHeading.variable,
        fontMono.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
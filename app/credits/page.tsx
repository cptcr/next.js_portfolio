import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Credits | Anton Schmidt',
  description: 'Attributions and credits for technologies used in this website',
};

type CreditItem = {
  name: string;
  description: string;
  url: string;
};

const developmentCredits: CreditItem[] = [
  {
    name: 'Next.js',
    description: 'The React framework for building modern web applications',
    url: 'https://nextjs.org/',
  },
  {
    name: 'TypeScript',
    description: 'Typed JavaScript at any scale',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'Tailwind CSS',
    description: 'A utility-first CSS framework for rapid UI development',
    url: 'https://tailwindcss.com/',
  },
  {
    name: 'shadcn/ui',
    description: 'Beautifully designed components that you can copy and paste into your apps',
    url: 'https://ui.shadcn.com/',
  },
  {
    name: 'Lucide Icons',
    description: 'Beautiful & consistent icons built by the community',
    url: 'https://lucide.dev/',
  },
];

const designCredits: CreditItem[] = [
  {
    name: 'Unsplash',
    description:
      "Beautiful, free images gifted by the world's most generous community of photographers",
    url: 'https://unsplash.com/',
  },
  {
    name: 'Google Fonts',
    description: 'Making the web more beautiful, fast, and open through great typography',
    url: 'https://fonts.google.com/',
  },
];

const peopleCredits: CreditItem[] = [
  {
    name: 'Tony (cptcr)',
    description: 'Backend developer and core maintainer of this project',
    url: 'https://github.com/cptcr',
  },
  {
    name: 'Claude',
    description: 'Frontend developer and designer who contributed to the UI/UX',
    url: 'https://claude.ai/',
  },
];

export default function CreditsPage() {
  return (
    <div className="container max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Credits</h1>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          This website wouldn't be possible without these amazing technologies, tools, and
          resources. Thank you to all the creators and contributors!
        </p>
      </div>

      <div className="space-y-12">
        {/* Development Credits */}
        <section>
          <h2 className="pb-2 mb-6 text-2xl font-semibold border-b">Development</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {developmentCredits.map((credit) => (
              <Card key={credit.name} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    {credit.name}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={credit.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{credit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* People Credits */}
        <section>
          <h2 className="pb-2 mb-6 text-2xl font-semibold border-b">People</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {peopleCredits.map((credit) => (
              <Card key={credit.name} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    {credit.name}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={credit.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{credit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Design Credits */}
        <section>
          <h2 className="pb-2 mb-6 text-2xl font-semibold border-b">Design Resources</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {designCredits.map((credit) => (
              <Card key={credit.name} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    {credit.name}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={credit.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{credit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Inspiration Section */}
        <section>
          <h2 className="pb-2 mb-6 text-2xl font-semibold border-b">Inspiration</h2>
          <div className="p-6 rounded-lg bg-card">
            <p className="text-muted-foreground">
              I would like to thank the entire developer community for the inspiration and knowledge
              sharing. Countless blogs, tutorials, open-source projects, and forum discussions have
              contributed to making this website a reality.
            </p>
          </div>
        </section>
      </div>

      {/* CTA Back Home */}
      <div className="mt-12 text-center">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}

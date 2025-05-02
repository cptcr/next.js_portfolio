import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Information',
  description: 'Imprint and Privacy Policy for my portfolio website',
};

export default function LegalPage() {
  return (
    <div className="container max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-center md:text-4xl">Legal Information</h1>

      <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
        <Link href="/legal/imprint" className="w-full md:w-auto">
          <Button variant="outline" size="lg" className="w-full">
            Imprint
          </Button>
        </Link>

        <Link href="/legal/privacy" className="w-full md:w-auto">
          <Button variant="outline" size="lg" className="w-full">
            Privacy Policy
          </Button>
        </Link>
      </div>

      <div className="mt-8 text-center text-muted-foreground">
        <p>This legal information is provided in accordance with German and EU law.</p>
      </div>
    </div>
  );
}

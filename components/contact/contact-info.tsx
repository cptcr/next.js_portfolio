import Link from 'next/link';
import { Mail, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { config } from '@/config/contact/info';

export default function ContactInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email */}
        <div className="flex items-center">
          <Mail className="w-5 h-5 mr-3 text-primary" />
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <Link
              href="mailto:contact@cptcr.dev"
              className="transition-colors text-muted-foreground hover:text-primary"
            >
              {config.email}
            </Link>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center">
          <MapPin className="w-5 h-5 mr-3 text-primary" />
          <div>
            <h3 className="text-sm font-medium">Location</h3>
            <p className="text-muted-foreground">{config.location.city}, {config.location.country}</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="pt-4 border-t border-border">
          <h3 className="mb-3 text-sm font-medium">Connect With Me</h3>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="https://github.com/cptcr" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="https://twitter.com/cptcrr" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-4 h-4" />
                Twitter
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

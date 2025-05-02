import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { imprint } from '@/config/legal/imprint';

export const metadata: Metadata = {
  title: 'Imprint',
  description: 'Legal imprint for my portfolio website',
};

export default function ImprintPage() {
  return (
    <div className="container max-w-3xl px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/legal" className="flex items-center">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Link>
        </Button>
      </div>

      <div className="prose prose-gray max-w-none dark:prose-invert">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Imprint</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">Information According to § 5 TMG</h2>
            <p>{imprint.name}</p>
            <p>{imprint.address.street}</p>
            <p>
              {imprint.address.postalCode} {imprint.address.city}
            </p>
            <p>{imprint.address.country}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Contact</h2>
            {imprint.contact.phone && <p>Phone: {imprint.contact.phone}</p>}
            <p>Email: {imprint.contact.email}</p>
            {imprint.contact.website && <p>Website: {imprint.contact.website}</p>}
          </section>

          {imprint.responsibleForContent && (
            <section>
              <h2 className="text-2xl font-semibold">Responsible for Content</h2>
              <p>{imprint.responsibleForContent}</p>
            </section>
          )}

          {imprint.disclaimer && (
            <section>
              <h2 className="text-2xl font-semibold">Disclaimer</h2>
              <p>{imprint.disclaimer}</p>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold">Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (OS):
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>
              We are not willing or obliged to participate in dispute resolution proceedings before
              a consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Liability for Content</h2>
            <p>
              As a service provider, I am responsible for my own content on these pages according to
              general laws. However, I am not obliged to monitor transmitted or stored third-party
              information or to investigate circumstances that indicate illegal activity.
            </p>
            <p>
              Obligations to remove or block the use of information according to general laws remain
              unaffected. However, liability in this regard is only possible from the time of
              knowledge of a specific legal violation. Upon becoming aware of such legal violations,
              I will remove this content immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Liability for Links</h2>
            <p>
              My website contains links to external third-party websites, over whose content I have
              no influence. Therefore, I cannot assume any liability for these external contents.
              The respective provider or operator of the linked pages is always responsible for the
              content of the linked pages.
            </p>
            <p>
              The linked pages were checked for possible legal violations at the time of linking.
              Illegal content was not recognizable at the time of linking. However, permanent
              monitoring of the content of the linked pages is unreasonable without concrete
              evidence of a violation of law. Upon becoming aware of legal violations, I will remove
              such links immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Copyright</h2>
            <p>
              The content and works created by the site operators on these pages are subject to
              German copyright law. Duplication, processing, distribution, and any kind of
              exploitation outside the limits of copyright require the written consent of the
              respective author or creator.
            </p>
            <p>
              Downloads and copies of this site are only permitted for private, non-commercial use.
              Insofar as the content on this site was not created by the operator, the copyrights of
              third parties are respected. In particular, third-party content is marked as such.
              Should you nevertheless become aware of a copyright infringement, please provide
              corresponding notice. Upon becoming aware of legal violations, I will remove such
              content immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

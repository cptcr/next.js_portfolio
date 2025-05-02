import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { imprint } from '@/config/legal/imprint';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for my portfolio website',
};

export default function PrivacyPolicyPage() {
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
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Privacy Policy</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Data Controller</h2>
            <p>The data controller responsible for data processing on this website is:</p>
            <p>{imprint.name}</p>
            <p>{imprint.address.street}</p>
            <p>
              {imprint.address.postalCode} {imprint.address.city}
            </p>
            <p>{imprint.address.country}</p>
            <p>Email: {imprint.contact.email}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. General Information</h2>
            <p>
              I take the protection of your personal data very seriously. I treat your personal data
              confidentially and in accordance with the statutory data protection regulations and
              this privacy policy.
            </p>
            <p>
              When you visit this website, various personal data may be collected. This privacy
              policy explains what information I collect and what I use it for. It also explains how
              and for what purpose this happens.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Data Collection on This Website</h2>

            <h3 className="mt-4 text-xl font-semibold">Server Log Files</h3>
            <p>
              The website provider automatically collects and stores information in server log
              files, which your browser automatically transmits to us:
            </p>
            <ul className="pl-5 space-y-1 list-disc">
              <li>Browser type and version</li>
              <li>Operating system used</li>
              <li>Referrer URL</li>
              <li>Hostname of the accessing computer</li>
              <li>Time of the server request</li>
              <li>IP address</li>
            </ul>
            <p>
              This data is not combined with other data sources. The data is collected based on Art.
              6 (1) (f) GDPR. The website operator has a legitimate interest in the technically
              error-free presentation and optimization of their website – for this, server log files
              need to be collected.
            </p>

            <h3 className="mt-4 text-xl font-semibold">Cookies</h3>
            <p>
              This website may use cookies. Cookies do not harm your computer and do not contain
              viruses. Cookies serve to make our offering more user-friendly, effective, and secure.
              Cookies are small text files that are stored on your computer and saved by your
              browser.
            </p>
            <p>
              Most of the cookies I use are "session cookies." They are automatically deleted at the
              end of your visit. Other cookies remain stored on your device until you delete them.
              These cookies enable me to recognize your browser the next time you visit the website.
            </p>
            <p>
              You can set your browser to inform you about the setting of cookies and only allow
              cookies in individual cases, exclude the acceptance of cookies for certain cases or in
              general, and activate the automatic deletion of cookies when closing the browser. When
              cookies are deactivated, the functionality of this website may be limited.
            </p>
            <p>
              Cookies that are necessary for the electronic communication process or for providing
              certain functions you want to use are stored based on Art. 6 (1) (f) GDPR. The website
              operator has a legitimate interest in storing cookies for the technically error-free
              and optimized provision of its services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Payment Processing</h2>
            <p>
              When you purchase services through this website, payment processing is handled by
              Stripe. Your payment data is transmitted to Stripe for processing. I do not store your
              payment data.
            </p>
            <p>
              For more information about Stripe's privacy practices, please visit their Privacy
              Policy at:{' '}
              <a href="https://stripe.com/en-de/privacy" target="_blank" rel="noopener noreferrer">
                https://stripe.com/en-de/privacy
              </a>
            </p>
            <p>
              The legal basis for this processing is Art. 6 (1) (b) GDPR (performance of a
              contract).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Your Rights</h2>
            <p>Under the GDPR, you have the following rights:</p>
            <ul className="pl-5 space-y-1 list-disc">
              <li>
                Right to information about your stored personal data and its origin, recipient, and
                purpose of processing (Art. 15 GDPR)
              </li>
              <li>Right to correction of inaccurate or incomplete data (Art. 16 GDPR)</li>
              <li>Right to deletion of your stored data (Art. 17 GDPR)</li>
              <li>Right to restriction of data processing (Art. 18 GDPR)</li>
              <li>Right to data portability (Art. 20 GDPR)</li>
              <li>Right to object to processing of your personal data (Art. 21 GDPR)</li>
            </ul>
            <p>
              If you believe that the processing of your data violates data protection law or your
              data protection rights have been violated in any other way, you can contact the
              responsible supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Changes to This Privacy Policy</h2>
            <p>
              I reserve the right to change this privacy policy to comply with changes in laws or
              regulations, or changes in business practices. The current version of the privacy
              policy is always available on this website.
            </p>
            <p>Last updated: May 2, 2025</p>
          </section>
        </div>
      </div>
    </div>
  );
}

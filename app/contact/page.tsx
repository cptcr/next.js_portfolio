import { Metadata } from "next";
import ContactForm from "@/components/contact/contact-form";
import ContactInfo from "@/components/contact/contact-info";
import AvailabilityStatus from "@/components/contact/availability-status";

// Fetch dynamic status directly inside the Server Component with error handling
async function fetchDiscordStatus() {
  // Construct the API URL using the environment variable
  const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/discord/status`;

  // Log the URL being used during the build process for debugging
  console.log(`[Contact Page Build] Fetching Discord status from: ${apiUrl}`);

  try {
    // Attempt to fetch the status from the API route
    const res = await fetch(apiUrl, {
        // Optional: Add cache control if needed, e.g., no-store for always fresh data
        // cache: 'no-store'
    });

    // Check if the fetch was successful (status code 200-299)
    if (!res.ok) {
      // Log an error if the response status indicates failure
      console.error(
        `[Contact Page Build] Error fetching Discord status: HTTP status ${res.status}`,
        await res.text() // Log the response body for more details
      );
      // Return a fallback status to prevent build crash
      return 'Error';
    }

    // Parse the JSON response
    const data = await res.json();

    // Return the status from the data, or 'Offline' as a default
    return data.status || 'Offline';

  } catch (error) {
    // Catch any network errors or other issues during the fetch operation
    console.error(`[Contact Page Build] Failed to fetch Discord status from ${apiUrl}:`, error);
    // Return a fallback status in case of fetch errors
    return 'Error';
  }
}

export const metadata: Metadata = {
  title: "Contact | Tony (cptcr)",
  description: "Get in touch with Tony, a 17-year-old backend developer from Stuttgart, Germany specializing in Next.js, TypeScript, and TailwindCSS.",
};

export default async function ContactPage() {
  // Fetch dynamic status on the server side using the updated function
  const dynamicStatus = await fetchDiscordStatus();

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground">
              Have a project in mind or just want to chat? I'm always open to new opportunities and collaborations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
              {/* Form */}
              <div className="lg:col-span-3">
                <ContactForm />
              </div>

              {/* Contact Info */}
              <div className="space-y-8 lg:col-span-2">
                <ContactInfo />
                {/* Dynamically rendered status */}
                <div className="text-sm text-muted-foreground">
                  {/* Display the fetched status (or 'Error' if fetch failed) */}
                  <p>Status: {dynamicStatus}</p>
                </div>
                <AvailabilityStatus />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Metadata } from "next"
import ContactForm from "@/components/contact/contact-form"
import ContactInfo from "@/components/contact/contact-info"
import AvailabilityStatus from "@/components/contact/availability-status"

// Fetch dynamic status directly inside the Server Component
async function fetchDiscordStatus() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/discord/status`)
  const data = await res.json()
  return data.status || 'Offline'
}

export const metadata: Metadata = {
  title: "Contact | Tony (cptcr)",
  description: "Get in touch with Tony, a 17-year-old backend developer from Stuttgart, Germany specializing in Next.js, TypeScript, and TailwindCSS.",
}

export default async function ContactPage() {
  // Fetch dynamic status on the server side
  const dynamicStatus = await fetchDiscordStatus()

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
                  <p>Status: {dynamicStatus}</p>
                </div>
                <AvailabilityStatus />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import { Metadata } from "next"
import ContactForm from "@/components/contact/contact-form"
import ContactInfo from "@/components/contact/contact-info"
import AvailabilityStatus from "@/components/contact/availability-status"

export const metadata: Metadata = {
  title: "Contact | Tony (cptcr)",
  description: "Get in touch with Tony, a 17-year-old backend developer from Stuttgart, Germany specializing in Next.js, TypeScript, and TailwindCSS.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <ContactForm />
              </div>
              
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <ContactInfo />
                <AvailabilityStatus />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
// components/contact/contact-form.tsx

"use client"

import { useState, FormEvent } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isValidEmail } from "@/lib/utils/helpers"

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

type FormErrors = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

type SubmissionStatus = "idle" | "submitting" | "success" | "error"

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<SubmissionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Validate a single field
  const validateField = (name: keyof FormState, value: string): string | undefined => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Name is required" : undefined
      case "email":
        return !isValidEmail(value) ? "Valid email is required" : undefined
      case "subject":
        return value.trim().length < 3 ? "Subject is required" : undefined
      case "message":
        return value.trim().length < 10 ? "Message must be at least 10 characters" : undefined
      default:
        return undefined
    }
  }
  
  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true
    
    // Check each field
    Object.entries(formState).forEach(([key, value]) => {
      const fieldName = key as keyof FormState
      const error = validateField(fieldName, value)
      
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })
    
    setErrors(newErrors)
    return isValid
  }
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error for this field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    // Set status to submitting
    setStatus("submitting")
    setErrorMessage(null)
    
    try {
      // Send the form data to our API route
      const response = await fetch('/api/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Something went wrong');
      }
      
      // If successful, clear form and show success message
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setStatus("success")
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle")
      }, 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }
  
  // Determine button state
  const isSubmitDisabled = status === "submitting"
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Me a Message</CardTitle>
        <CardDescription>
          Fill out the form below and I'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Your name"
              className={errors.name ? "border-red-500" : ""}
              disabled={status === "submitting"}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              placeholder="Your email address"
              className={errors.email ? "border-red-500" : ""}
              disabled={status === "submitting"}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          
          {/* Subject Field */}
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              value={formState.subject}
              onChange={handleChange}
              placeholder="What's this about?"
              className={errors.subject ? "border-red-500" : ""}
              disabled={status === "submitting"}
            />
            {errors.subject && (
              <p className="text-xs text-red-500">{errors.subject}</p>
            )}
          </div>
          
          {/* Message Field */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              value={formState.message}
              onChange={handleChange}
              placeholder="Your message"
              rows={5}
              className={errors.message ? "border-red-500" : ""}
              disabled={status === "submitting"}
            />
            {errors.message && (
              <p className="text-xs text-red-500">{errors.message}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start space-y-4">
          {/* Status Messages */}
          {status === "success" && (
            <div className="flex items-center w-full p-3 rounded-md text-sm bg-green-500/10 text-green-500">
              <Check className="h-4 w-4 mr-2" />
              <span>Message sent successfully! I'll get back to you soon.</span>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex items-center w-full p-3 rounded-md text-sm bg-red-500/10 text-red-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage || "Something went wrong. Please try again."}</span>
            </div>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
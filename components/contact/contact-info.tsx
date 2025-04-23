import Link from "next/link"
import { Mail, MapPin, Github, Linkedin, Twitter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ContactInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email */}
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-primary mr-3" />
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <Link 
              href="mailto:contact@cptcr.dev" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              contact@cptcr.dev
            </Link>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-primary mr-3" />
          <div>
            <h3 className="text-sm font-medium">Location</h3>
            <p className="text-muted-foreground">Stuttgart, Germany</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-3">Connect With Me</h3>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="https://github.com/cptcr" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                GitHub
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="https://twitter.com/cptcrr" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                Twitter
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
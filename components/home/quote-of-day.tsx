"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Quote {
  content: string
  author: string
}

export default function QuoteOfDay() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuote() {
      try {
        setLoading(true)
        const response = await fetch('/api/quote')
        
        if (!response.ok) {
          throw new Error('Failed to fetch quote')
        }
        
        const data = await response.json()
        setQuote(data)
      } catch (err) {
        console.error('Error fetching quote:', err)
        setError('Could not load quote. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [])

  return (
    <Card className="overflow-hidden backdrop-blur-lg bg-card/50 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Quote of the Day
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center min-h-[100px]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-muted-foreground italic">{error}</p>
          ) : quote ? (
            <>
              <p className="text-lg font-medium mb-2 italic">
                "{quote.content}"
              </p>
              <p className="text-sm text-muted-foreground">
                — {quote.author}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground italic">No quote available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
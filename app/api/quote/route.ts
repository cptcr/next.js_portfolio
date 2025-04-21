import { NextResponse } from 'next/server'

const FALLBACK_QUOTES = [
  { content: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { content: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { content: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { content: "Make it work, make it right, make it fast.", author: "Kent Beck" }
]

export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch('https://zenquotes.io/api/random', { signal: controller.signal })

    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()

    return NextResponse.json({
      content: data[0].q,
      author: data[0].a
    })
  } catch (err) {
    console.error('Quote API failed:', err)
    const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
    return NextResponse.json(fallback)
  }
}

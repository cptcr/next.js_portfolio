import { Metadata } from "next"
import Skills from "@/components/about/skills"
import Timeline from "@/components/about/timeline"
import GithubContributions from "@/components/about/github-contributions"

export const metadata: Metadata = {
  title: "About | Tony (cptcr)",
  description: "Learn more about Tony, a 17-year-old backend developer from Stuttgart, Germany specializing in Next.js, TypeScript, and TailwindCSS.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Me
            </h1>
            <p className="text-xl text-muted-foreground">
              A passionate backend developer from Stuttgart, Germany, focused on creating
              efficient, scalable applications and contributing to the developer community.
            </p>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-12 bg-card">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Who I Am</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Hello! I'm Tony, also known as <span className="text-primary font-medium">cptcr</span> online.
                  I'm a 17-year-old backend developer living near Stuttgart, Germany.
                </p>
                <p>
                  My journey in programming began when I was 14, starting with simple HTML and CSS websites.
                  As my curiosity grew, I ventured into JavaScript, then Node.js, and eventually discovered
                  my passion for backend development and APIs.
                </p>
                <p>
                  Today, I specialize in building robust applications with Next.js, TypeScript, and TailwindCSS.
                  I'm particularly interested in creating efficient APIs and backend services that power modern
                  web applications.
                </p>
                <p>
                  When I'm not coding, you can find me exploring new technologies, contributing to open-source
                  projects, or helping other developers in online communities.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col justify-start space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">Location</h3>
                <p className="text-muted-foreground">Stuttgart, Germany</p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Languages</h3>
                <ul className="text-muted-foreground">
                  <li>German (Native)</li>
                  <li>English (Fluent)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Education</h3>
                <p className="text-muted-foreground">
                  High School Student<br />
                  Self-taught Developer
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">My Skills</h2>
            <Skills />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-card">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">My Journey</h2>
            <Timeline />
          </div>
        </div>
      </section>

      {/* GitHub Contributions Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">GitHub Activity</h2>
            <p className="text-center text-muted-foreground mb-8">
              My real-time GitHub contributions and activity, pulled directly from the GitHub API.
            </p>
            <GithubContributions username="cptcr" />
          </div>
        </div>
      </section>
    </div>
  )
}
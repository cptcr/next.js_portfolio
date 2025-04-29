import { Metadata } from 'next';
import Skills from '@/components/about/skills';
import Timeline from '@/components/about/timeline';
import GithubContributions from '@/components/about/github-contributions';
import about from '@/config/about/about';

export const metadata: Metadata = {
  title: about.metadata.title,
  description: about.metadata.description,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">{about.content.hero.title}</h1>
            <p className="text-xl text-muted-foreground">{about.content.hero.description}</p>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-12 bg-card">
        <div className="container px-4">
          <div className="grid max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="mb-4 text-2xl font-bold">Who I Am</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Hello! I'm Tony, also known as{' '}
                  <span className="font-medium text-primary">cptcr</span> online. I'm a 17-year-old
                  backend developer living near Stuttgart, Germany.
                </p>
                <p>
                  My journey in programming began when I was 14, starting with simple HTML and CSS
                  websites. As my curiosity grew, I ventured into JavaScript, then Node.js, and
                  eventually discovered my passion for backend development and APIs.
                </p>
                <p>
                  Today, I specialize in building robust applications with Next.js, TypeScript, and
                  TailwindCSS. I'm particularly interested in creating efficient APIs and backend
                  services that power modern web applications.
                </p>
                <p>
                  When I'm not coding, you can find me exploring new technologies, contributing to
                  open-source projects, or helping other developers in online communities.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-start space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-medium">Location</h3>
                <p className="text-muted-foreground">Stuttgart, Germany</p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-medium">Languages</h3>
                <ul className="text-muted-foreground">
                  <li>German (Native)</li>
                  <li>English (Fluent)</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-medium">Education</h3>
                <p className="text-muted-foreground">
                  High School Student
                  <br />
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
            <h2 className="mb-8 text-3xl font-bold text-center">My Skills</h2>
            <Skills />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-card">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-8 text-3xl font-bold text-center">My Journey</h2>
            <Timeline />
          </div>
        </div>
      </section>

      {/* GitHub Contributions Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-8 text-3xl font-bold text-center">GitHub Activity</h2>
            <p className="mb-8 text-center text-muted-foreground">
              My real-time GitHub contributions and activity, pulled directly from the GitHub API.
            </p>
            <GithubContributions username="cptcr" />
          </div>
        </div>
      </section>
    </div>
  );
}

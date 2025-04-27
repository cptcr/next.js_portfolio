import { Metadata } from 'next';
import ProjectList from '@/components/projects/project-list';
import GithubActivity from '@/components/projects/github-activity';

export const metadata: Metadata = {
  title: 'Projects | Tony (cptcr)',
  description:
    "Explore Tony's projects including the Nexus Discord Bot, macro_api library, and other backend development work.",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">My Projects</h1>
            <p className="text-xl text-muted-foreground">
              A showcase of my work in backend development, API integration, and web applications.
              These projects demonstrate my skills in Next.js, TypeScript, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <ProjectList />
          </div>
        </div>
      </section>

      {/* GitHub Activity */}
      <section className="py-12 bg-card">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Recent GitHub Activity</h2>
            <p className="text-center text-muted-foreground mb-8">
              Real-time updates from my GitHub repositories, pulled directly from the GitHub API.
            </p>
            <GithubActivity username="cptcr" />
          </div>
        </div>
      </section>
    </div>
  );
}

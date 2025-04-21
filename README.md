# Tony (cptcr) - Portfolio Website

A modern, professional portfolio website for Tony (cptcr), a 17-year-old backend developer with a focus on Next.js, TypeScript, and TailwindCSS. The website showcases skills, projects, and community contributions while integrating real-time data to demonstrate backend skills.

## 🚀 Features

- **Modern Design**: Dark-mode focused with accent colors and clean typography
- **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop screens
- **Real-time Data Integration**:
  - GitHub API integration showing contributions, repositories, and activity
  - Real-time availability status based on Germany timezone
  - "Quote of the Day" from external API
- **Interactive Elements**:
  - Animated page transitions and UI elements using Framer Motion
  - Interactive project cards with expandable details
  - Real-time form validation
- **Optimized Performance**:
  - Server-side rendering with Next.js
  - API route caching
  - Optimized image loading

## 🔧 Tech Stack

- **Frontend**: 
  - Next.js 14 with App Router
  - React 18
  - TypeScript
  - TailwindCSS
  - ShadCN UI Components
  - Framer Motion for animations

- **Backend**:
  - Next.js API Routes
  - GitHub API Integration
  - Real-time data fetching

## 📋 Pages

1. **Home**: Introduction with animated hero section and featured projects
2. **About**: Background information, skills, and GitHub contributions dashboard
3. **Projects**: Showcase of projects with filtering and GitHub activity feed
4. **Community**: Open source contributions and mentorship activities
5. **Blog**: Articles with search and filtering capabilities
6. **Contact**: Contact form with real-time validation and availability indicator

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/cptcr/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**  
   Create a `.env.local` file in the root directory with the following:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   ```
   
   Note: The GitHub token is optional but recommended for higher API rate limits and access to GraphQL API.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🚀 Deployment

The site is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add your environment variables
3. Deploy with a single click

## 📁 Project Structure

```
cptcr-website/
│
├── app/                  # App Router pages and layouts
│   ├── api/              # API routes
│   ├── about/            # About page
│   ├── projects/         # Projects page
│   ├── community/        # Community page
│   ├── blog/             # Blog pages
│   ├── contact/          # Contact page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
│
├── components/           # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   ├── layout/           # Layout components
│   ├── home/             # Home page components
│   └── [feature]/        # Feature-specific components
│
├── lib/                  # Utility functions and types
│   ├── api/              # API utilities
│   ├── utils/            # General utilities
│   └── types/            # TypeScript types
│
├── public/               # Static assets
├── tailwind.config.js    # TailwindCSS configuration
└── next.config.js        # Next.js configuration
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 About the Developer

This portfolio was developed by Tony (cptcr), a 17-year-old backend developer from Stuttgart, Germany, specializing in Next.js, TypeScript, and TailwindCSS.

- GitHub: [github.com/cptcr](https://github.com/cptcr)
- Twitter: [twitter.com/cptcr](https://twitter.com/cptcr)
- LinkedIn: [linkedin.com/in/cptcr](https://linkedin.com/in/cptcr)
# Next.js Portfolio & Blog

A modern, responsive portfolio and blog application built with Next.js, TypeScript, TailwindCSS, and ShadCN UI components.

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- Modern, responsive design with dark mode support
- Mobile-friendly interface for seamless user experience
- Fully featured blog with Markdown support
- Admin dashboard with authentication
- Analytics dashboard for blog post insights
- Editorial calendar for content scheduling
- User management system for account handling
- Customizable site settings for personalization
- Discord webhook integration for notifications
- GitHub activity integration for showcasing contributions
- Contact form with email functionality
- SEO optimized for better search engine visibility

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Database**: [Neon PostgreSQL](https://neon.tech)
- **Authentication**: JWT with bcrypt
- **CMS**: Built-in admin dashboard
- **Storage**: Vercel Blob for blog posts
- **Hosting**: [Vercel](https://vercel.com)
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

Ensure the following are installed:

- **Node.js 18+** (Latest LTS version recommended)
- **PostgreSQL database** (Neon recommended)
- **SMTP server** for email functionality (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/cptcr/next.js_portfolio.git
   cd next.js_portfolio
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Copy the `.env.example` file to create your `.env` file:

   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables in the `.env` file:

   - Database URL (from [Neon](https://neon.tech))
   - JWT Secret
   - Admin credentials
   - Email settings
   - Discord integration (optional)
   - GitHub token (optional)
   - Vercel Blob credentials (for blog storage)

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Initial Setup

Upon first run, you'll be prompted to create an admin account through the admin setup page:

1. Navigate to `/admin` in your browser.
2. Complete the setup form to create your admin account.
3. Once created, log in to access the dashboard.

## Project Structure

```
├── app/                     # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # API routes
│   ├── blog/                # Blog pages
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── projects/            # Projects page
│   └── ...
├── components/              # React components
│   ├── admin/               # Admin dashboard components
│   ├── blog/                # Blog components
│   ├── ui/                  # UI components (ShadCN)
│   └── ...
├── lib/                     # Utility functions, services, and API
│   ├── api/                 # API integrations
│   ├── auth/                # Authentication utilities
│   ├── db/                  # Database models and schema
│   ├── services/            # Business logic services
│   └── utils/               # Helper utilities
├── public/                  # Static assets
├── scripts/                 # Utility scripts
└── ...
```

## Database Setup

This project uses Neon Postgres with Drizzle ORM. Follow these steps to set up the database:

1. Create a free account at [Neon](https://neon.tech).
2. Create a new project and database.
3. Copy the connection string and add it to the `.env` file as `DATABASE_URL`.

### User Management

Manage users using the provided scripts:

```bash
# Create a new user
npm run create_user

# Delete a user
npm run delete_user
```

## Blog Storage

Blog posts are stored using Vercel Blob. To set up this feature:

1. Configure Vercel Blob in your Vercel project settings.
2. Add your Blob read/write token to your `.env` file as `BLOB_READ_WRITE_TOKEN`.

## Discord Integration

For integrating Discord status and webhooks:

1. Create a Discord bot at [Discord Developer Portal](https://discord.com/developers/applications).
2. Add the bot token and your user ID to `.env` as `DISCORD_BOT_TOKEN` and `DISCORD_USER_ID`.
3. Set up a webhook URL for notifications and add it to `.env` as `DISCORD_WEBHOOK_URL`.

## Customization

### Styling

Customize the design by adjusting the following:

1. Update `tailwind.config.js` to modify colors, fonts, and other design elements.
2. Modify global styles in `app/globals.css`.
3. Customize individual components within the `components` directory.

### Content

Update your personal content in these locations:

- `app/page.tsx` - Landing page content
- `app/about/page.tsx` - About page information
- `components/layout/footer.tsx` - Footer links and details
- `app/projects/page.tsx` - Showcase projects

## Deployment

To deploy this project, Vercel is the recommended platform. Follow these steps:

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure environment variables within Vercel project settings.
4. Deploy your project!

For other hosting platforms, ensure you:

- Set up environment variables.
- Configure the build command (`npm run build`).
- Specify the output directory (`/.next`).

## Scripts

- `npm run dev` - Start the development server.
- `npm run build` - Build the application for production.
- `npm run start` - Start the production server.
- `npm run lint` - Run ESLint.
- `npm run create_user` - Create a new user.
- `npm run delete_user` - Delete a user.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add an amazing feature'`).
4. Push your branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Built with
[![Next.js](https://img.shields.io/badge/Next.js-v15-000000?style=for-the-badge&logo=next.js&logoColor=ffffff)](https://nextjs.org/)
[![Neon](https://img.shields.io/badge/Neon-Cloud-9c64c5?style=for-the-badge)](https://neon.tech/)
[![ShadCN](https://img.shields.io/badge/ShadCN-UI-0088cc?style=for-the-badge)](https://shadcn.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.0-38b2ac?style=for-the-badge&logo=tailwindcss&logoColor=ffffff)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide-Icons-ff8b00?style=for-the-badge)](https://lucide.dev/)

---

Created by [CPTCR](https://github.com/cptcr)
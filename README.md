
# Portfolio Website

Built with Next 15, React 19 and much much love.

---
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcptcr%2Fnext.js_portfolio&env=DISCORD_USER_ID,DISCORD_BOT_TOKEN,USE_LANYARD,EMAIL_HOST,EMAIL_AUTH_USERNAME,EMAIL_AUTH_PASSWORD,EMAIL_SECURE,ADMIN_USERNAME,ADMIN_PASSWORD,JWT_SECRET&envDescription=Discord%20Bot%20Token%20(required)%2C%20GitHub%20API%20Key%20(optional)&project-name=nextjs-portfolio&repository-name=Next.js-Portfolio&redirect-url=https%3A%2F%2Fcptcr.dev&demo-title=Next.js%20Portfolio%20with%20Blog%20management&demo-description=This%20is%20a%20Next.js%20Portfolio%20with%20a%20dedicated%20portal%20to%20create%20and%20manage%20blog%20posts.&demo-url=https%3A%2F%2Fcptcr.dev) 

## 🚀 Features

- **Modern UI**: Dark mode with clean typography and accent colors
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Integrations**:
  - GitHub activity, repositories, and contributions via API
  - Availability status (based on Germany timezone)
  - “Quote of the Day” from external API
- **Interactive Experience**:
  - Smooth page transitions with Framer Motion
  - Expandable project cards
  - Real-time form validation
- **Performance Optimizations**:
  - Server-side rendering with caching
  - Optimized image loading
- **Admin Dashboard**
  - Edit and manage posts
  - Create posts
  - Get post analytics

---

## 🧱 Tech Stack

### Frontend
- [Next.js 15](https://nextjs.org/blog/next-15)
- [React 19](https://react.dev/blog/2024/12/05/react-19)
- [TypeScript 5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)
- [TailwindCSS 4.1](https://tailwindcss.com/)
- [ShadCN UI 2](https://ui.shadcn.com/)
- [Framer Motion](https://motion.dev/)

### Backend
- Next.js API Routes
- GitHub API integration
- Real-time data fetching

---

## 📄 Pages

1. **Home** – Animated hero + featured projects  
2. **About** – Skills and GitHub dashboard  
3. **Projects** – Filterable showcase + activity feed  
4. **Community** – OSS contributions + mentorships  
5. **Blog** – Searchable, filterable articles  
6. **Contact** – Live validation + availability indicator  
7. **Admin** - Stats and post management

---

## 🛠️ Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/cptcr/next.js_portfolio.git
   cd next.js_portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install # or yarn or pnpm
   ```

3. **Environment config**

   Create a `.env.local` file:

   ```env
   GITHUB_TOKEN=

   # Discord Integration
   DISCORD_USER_ID=
   DISCORD_BOT_TOKEN=
   USE_LANYARD=false

   # Email
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_ADDRESS=
   EMAIL_SMTP_PORT=587
   EMAIL_AUTH_USERNAME=
   EMAIL_AUTH_PASSWORD=
   EMAIL_SECURE=

   # Auth
   ADMIN_USERNAME=cptcr
   ADMIN_PASSWORD=<secure-password>
   JWT_SECRET=<generate-a-secure-random-string>

   # Vercel
   # Run "npm i -g -D vercel"
   # After installation run "vercel init"
   # After init run "vercel env pull" (vercel will now create the required token, vercel may affect the env file so double check if everything is still here or create a backup file)
   VERCEL_OIDC_TOKEN=
   # In your deployed site on vercel,
   # go to storage and search if vercel already created one, if not,
   # click on add new, then enter /posts as directory and deploy it
   # after that go into the blob settings and obtain the key
   BLOB_READ_WRITE_TOKEN=

   # Used for the blogs api
   NEXT_PUBLIC_SITE_UTL=http://localhost:3000 # (Change if you use a domain)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open** `http://localhost:3000` in your browser

---

## 🌐 Deployment (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Add environment variables in the Vercel dashboard
3. Deploy instantly

---

## 📁 Project Structure

```
cptcr-website/
├── app/            # App Router pages
│   ├── api/        # API routes
│   ├── blog/       # Blog system
│   ├── contact/    # Contact page
│   └── ...         # Other routes
│
├── components/     # Reusable components
│   ├── ui/         # UI primitives
│   ├── layout/     # Layout components
│   └── [feature]/  # Page-specific components
│
├── lib/            # Utilities & types
│   ├── api/        
│   ├── utils/
│   └── types/
│
├── public/         # Static assets
├── tailwind.config.js
└── next.config.js
```

---

## 📝 License

Licensed under the [MIT License](LICENSE).

---

## 👨‍💻 About the Developer

Built by **Tony (cptcr)**, a 17-year-old backend developer based in Stuttgart, Germany, specializing in modern web stacks.

- GitHub: [@cptcr](https://github.com/cptcr)  
- Twitter: [@cptcr](https://twitter.com/cptcrr) 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'cdn.discordapp.com',
      'github.com',
    ],
  },
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  // Internationalization settings (if needed in the future)
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig
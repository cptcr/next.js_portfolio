/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'cdn.discordapp.com',
      'github.com',
    ],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    reactCompiler: true,
    concurrentFeatures: true,
    appDir: true,
    serverComponents: true,
    optimizeCss: true
  },
  transpilePackages: [
    'framer-motion',
    'lucide-react',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-dialog',
    '@radix-ui/react-popover',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-select'
  ],
}

module.exports = nextConfig
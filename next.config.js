/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'cdn.discordapp.com', 'github.com'],
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
    optimizeCss: true,
  },
  transpilePackages: [
    'framer-motion',
    'lucide-react',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-dialog',
    '@radix-ui/react-popover',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-select',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module and other Node.js specifics
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        pg: false,
        'pg-native': false,
        'cloudflare:sockets': false,
      };
    }
    
    // Ignore pg-native and other native modules with externals
    config.externals = [...(config.externals || []), 'pg-native'];
    
    // Additional fixes for problematic modules
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /node_modules\/pg\//,
          use: 'null-loader'
        }
      ]
    };
    
    return config;
  },
};

module.exports = nextConfig;
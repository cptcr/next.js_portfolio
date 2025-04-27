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
  ],webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: false,
      path: false,
      os: false,
      net: false,
      tls: false,
      'pg-native': false,
    };
  }

  config.externals = [...(config.externals || []), 'pg-native'];

  config.ignoreWarnings = [
    {
      message: /Critical dependency: the request of a dependency is an expression/,
    }
  ];

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
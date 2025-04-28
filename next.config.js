/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "cdn.discordapp.com",
      "github.com",
    ],
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
    "framer-motion",
    "lucide-react",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-dialog",
    "@radix-ui/react-popover",
    "@radix-ui/react-alert-dialog",
    "@radix-ui/react-select",
    "@mapbox/node-pre-gyp", // Added for transpilation
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        "pg-native": false,
      };
    }

    config.externals = [...(config.externals || []), "pg-native"];

    // Exclude non-JS files from `node-pre-gyp`
    config.module.rules.push({
      test: /node_modules\/@mapbox\/node-pre-gyp\/lib\/util\/nw-pre-gyp\/index\.html$/,
      use: 'null-loader', // Exclude HTML files
    });

    // Exclude `bluebird` and `underscore` from client-side bundling
    config.module.rules.push({
      test: /node_modules\/bluebird\/js\/browser\/bluebird\.js$/,
      use: "null-loader", // Exclude bluebird
    });

    config.module.rules.push({
      test: /node_modules\/underscore\/modules\/_setup\.js$/,
      use: "null-loader", // Exclude underscore
    });

    // Optional: Add HTML loader for other HTML files if needed
    config.module.rules.push({
      test: /\.html$/,
      use: 'html-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
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
    "@mapbox/node-pre-gyp",
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
        dns: false,
        child_process: false,
        "pg-native": false,
        "bcrypt": false, // Add bcrypt to fallback
        "node-gyp": false, // Add node-gyp to fallback
        "npm": false, // Add npm to fallback
        "@mswjs/interceptors/presets/node": false, // Add mswjs to fallback
      };
    }

    // Exclude specific modules from client bundle
    config.externals = [
      ...(config.externals || []),
      "pg-native",
      isServer ? {} : { "bcrypt": "bcrypt" } // Exclude bcrypt from client
    ];

    // Exclude non-JS files from `node-pre-gyp`
    config.module.rules.push({
      test: /node_modules\/@mapbox\/node-pre-gyp\/lib\/util\/nw-pre-gyp\/index\.html$/,
      use: 'null-loader', // Exclude HTML files
    });

    // Handle problematic modules
    config.module.rules.push({
      test: /node_modules\/bluebird\/js\/browser\/bluebird\.js$/,
      use: "null-loader", // Exclude bluebird
    });

    config.module.rules.push({
      test: /node_modules\/underscore\/modules\/_setup\.js$/,
      use: "null-loader", // Exclude underscore
    });

    // Exclude nock and its dependencies in client-side bundling
    config.module.rules.push({
      test: /node_modules\/nock\/.*$/,
      use: "null-loader",
    });

    // Exclude mapbox node-pre-gyp util files that try to import node-gyp or npm
    config.module.rules.push({
      test: /node_modules\/@mapbox\/node-pre-gyp\/lib\/util\/compile\.js$/,
      use: "null-loader",
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
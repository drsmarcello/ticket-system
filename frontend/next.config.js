/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@apollo/client"],
    // Static generation deaktivieren
    isrMemoryCacheSize: 0,
  },
  images: {
    domains: ["api.utilbox.de"],
  },
  // Disable strict mode for development
  reactStrictMode: false,

  // WICHTIG: Build-Prozess anpassen
  distDir: ".next",

  // Webpack config um Apollo Client richtig zu behandeln
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

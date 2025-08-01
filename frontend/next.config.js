/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@apollo/client"],
    isrMemoryCacheSize: 0,
  },
  images: {
    domains: ["api.utilbox.de"],
  },
  reactStrictMode: false,
  distDir: ".next",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // X-Powered-By Header entfernen (Next.js-spezifisch)
  poweredByHeader: false,
};

module.exports = nextConfig;

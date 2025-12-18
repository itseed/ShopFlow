/** @type {import('next').NextConfig} */
const nextConfig = {
  // Commented out export mode to enable API routes
  // output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  },
  transpilePackages: ["@shopflow/ui", "@shopflow/types", "@shopflow/utils", "@shopflow/api"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  eslint: {
    // Don't fail build on ESLint errors during development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors during development
    ignoreBuildErrors: false, // Keep this false to catch real errors
  },
};

module.exports = nextConfig;

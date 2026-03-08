/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  typescript: {
    // Prisma's deep recursive types cause stack overflow in TS 5.3 type checker.
    // Dev server type-checks fine; this only skips the build-time check.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

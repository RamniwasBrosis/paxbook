/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@paxbook/types"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "api.web.paxbook.in" },
    ],
  },
  // Constrained to 1 worker: the deployment host's CloudLinux LVE caps
  // concurrent processes per account low enough that Next's default
  // one-worker-per-CPU static-generation pool hits EAGAIN on spawn.
  experimental: {
    cpus: 1,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@paxbook/ui",
    "@paxbook/types",
    "@paxbook/config",
    "@paxbook/auth-client",
    "@paxbook/api-client",
  ],
  // Constrained to 1 worker: the deployment host's CloudLinux LVE caps
  // concurrent processes per account low enough that Next's default
  // one-worker-per-CPU static-generation pool hits EAGAIN on spawn.
  experimental: {
    cpus: 1,
  },
};

module.exports = nextConfig;

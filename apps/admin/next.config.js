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
  experimental: {
    // Constrained to 1 worker: the deployment host's CloudLinux LVE caps
    // concurrent processes per account low enough that Next's default
    // one-worker-per-CPU static-generation pool hits EAGAIN on spawn.
    cpus: 1,
    // Matches apps/user — any server-rendered dynamic page here should always
    // read fresh data on navigation rather than serve Next's client Router Cache.
    staleTimes: {
      dynamic: 0,
    },
  },
};

module.exports = nextConfig;

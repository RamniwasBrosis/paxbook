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
  experimental: {
    // Constrained to 1 worker: the deployment host's CloudLinux LVE caps
    // concurrent processes per account low enough that Next's default
    // one-worker-per-CPU static-generation pool hits EAGAIN on spawn.
    cpus: 1,
    // Account/booking pages read live, frequently-mutated data (payment status,
    // booking list). Next's default client Router Cache (30s for dynamic routes)
    // was serving stale RSC payloads on plain <Link> navigation between them —
    // disabling it forces a fresh server fetch on every visit to a dynamic page.
    staleTimes: {
      dynamic: 0,
    },
  },
};

module.exports = nextConfig;

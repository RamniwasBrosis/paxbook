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
  // The hero video must be cacheable: cPanel's nginx in front of the site drops Range requests for
  // uncacheable responses (sending the whole file with 200), and Safari won't play a video without
  // 206 range replies. Once cached, nginx answers ranges itself. Replace the file under a new name.
  async headers() {
    return [{ source: "/hero.mp4", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] }];
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

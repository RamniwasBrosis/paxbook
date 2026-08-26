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
};

module.exports = nextConfig;

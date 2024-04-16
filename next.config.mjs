/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPERSET_DOMAIN: process.env.SUPERSET_DOMAIN,
  },
};

export default nextConfig;

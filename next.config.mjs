/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASE_PATH,
  env: {
    SUPERSET_DOMAIN: process.env.SUPERSET_DOMAIN,
    DEFAULT_DASHBOARD_ID: process.env.DEFAULT_DASHBOARD_ID,
    DEFAULT_CUSTOMER_ID: process.env.DEFAULT_CUSTOMER_ID,
  },
};

export default nextConfig;

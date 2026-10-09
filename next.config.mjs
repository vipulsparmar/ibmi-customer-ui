/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/customers/:path*',
        destination: 'http://127.0.0.1:10010/web/services/CustomerService/customers/:path*',
      },
      {
        source: '/api/customers',
        destination: 'http://127.0.0.1:10010/web/services/CustomerService/customers',
      },
    ];
  },
};

export default nextConfig;
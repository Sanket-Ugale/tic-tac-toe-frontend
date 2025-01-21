// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [process.env.NEXT_PUBLIC_IMAGE_DOMAIN], // Dynamically load the domain from env variable
      },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date' },
        ],
      },
    ];
  },
};


export default nextConfig;
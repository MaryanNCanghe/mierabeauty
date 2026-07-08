
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'epptibwjvogadqehnyua.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/supabase-js\/dist\/index\.cjs/ },
    ];
    return config;
  },
  async redirects() {
    return [
      {
        source: '/list',
        destination: '/shop',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

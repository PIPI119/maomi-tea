/** @type {import('next').NextConfig} */
const nextConfig = {

  eslint: {

    ignoreDuringBuilds: true,
  },
  typescript: {

    ignoreBuildErrors: true,
  },
  

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      // ... и так далее
    ],
  },
};

export default nextConfig;
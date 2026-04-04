/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
      {
        protocol: "https",
        // Это захватит любой поддомен supabase.co, 
        // чтобы не зависеть от того, подхватился ли env.
        hostname: "*.supabase.co", 
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
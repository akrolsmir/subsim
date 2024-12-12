/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fkousziwzbnkdkldjper.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
}

export default nextConfig

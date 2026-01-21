/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    '@libsql/client',
    '@prisma/adapter-libsql',
  ],
}

module.exports = nextConfig
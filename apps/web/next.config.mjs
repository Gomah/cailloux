// import MillionLint from '@million/lint';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@acme/ui', '@acme/db', '@acme/emails'],

  productionBrowserSourceMaps: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    serverSourceMaps: false,
    serverComponentsExternalPackages: ['oslo', 'pino', 'pino-pretty'],
    typedRoutes: true,
  },

  webpack: (config) => {
    config.externals.push('@node-rs/argon2', '@node-rs/bcrypt');
    return config;
  },
};

// export default MillionLint.next(nextConfig, { rsc: true });
// MillionLint ignores custom webpack config: https://github.com/aidenybai/million/issues/1003
export default nextConfig;

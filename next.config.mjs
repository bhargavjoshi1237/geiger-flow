const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  basePath: isProd ? '/flow' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/flow' : '',
  },
};

export default nextConfig;


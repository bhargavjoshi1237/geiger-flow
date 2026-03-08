const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  basePath: isProd ? '/flow' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/flow' : '',
  },
};

export default nextConfig;


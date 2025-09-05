const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 번들 크기 최적화
  experimental: {
    optimizeCss: true,
  },
  
  // 번들 분석을 위한 설정
  webpack: (config, { isServer }) => {
    // 번들 크기 최적화
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Tree shaking 최적화
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    return config;
  },

  // 정적 최적화
  trailingSlash: false,
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 압축 최적화
  compress: true,
  
  // 불필요한 폴리필 제거
  experimental: {
    modern: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig);

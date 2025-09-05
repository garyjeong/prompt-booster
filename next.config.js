const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack 설정 (최신 Next.js 15 방식)
  turbopack: {
    // Turbopack 전용 설정 (필요시 추가)
  },

  // 이미지 최적화 (Turbopack 호환)
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 기본 Next.js 설정
  trailingSlash: false,
  compress: true,
  
  // 번들 분석기는 프로덕션 빌드에서만 사용 (Webpack 모드)
  ...(process.env.ANALYZE === 'true' && {
    // Bundle analyzer는 Webpack 모드에서만 동작
  }),
};

// 개발 모드에서 Turbopack 사용 시 Bundle Analyzer 비활성화
const isDev = process.env.NODE_ENV === 'development';
const useTurbopack = process.argv.includes('--turbopack');

if (isDev && useTurbopack) {
  // Turbopack 모드에서는 Bundle Analyzer 제외
  module.exports = nextConfig;
} else {
  // 프로덕션 빌드나 Webpack 모드에서는 Bundle Analyzer 포함
  module.exports = withBundleAnalyzer(nextConfig);
}
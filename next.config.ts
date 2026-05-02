import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'marloo.chbk.dev',
    'https://tapi.bale.ai',
    'https://marloo.shop',
    'https://dev.marloo.shop',
    'dev.marloo.shop',
    'marloo.shop'
  ],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: '',
          },
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' https://tapi.bale.ai 'unsafe-inline' 'unsafe-eval'; frame-src 'self' https://*.bale.ai https://marloo.shop https://dev.marloo.shop  https://marloo.chbk.dev; frame-ancestors 'self' https://*.bale.ai https://dev.marloo.shop  https://marloo.shop https://marloo.chbk.dev",

          },
        ],
      },
    ];
  },

  // پروکسی برای API بله (اختیاری)
  async rewrites() {
    return [
      {
        source: '/bale-api/:path*',
        destination: 'https://tapi.bale.ai/:path*',
      },
    ];
  },
};

export default nextConfig;

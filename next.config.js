/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/:path*"
            : "/api/",
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/docs"
            : "/api/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/openapi.json"
            : "/api/openapi.json",
      },
    ];
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    DAILY_FLAGSHIP_USAGE_LIMIT: process.env.DAILY_FLAGSHIP_USAGE_LIMIT,
    DAILY_USAGE_LIMIT: process.env.DAILY_USAGE_LIMIT
  },
  experimental: {
    outputFileTracingExcludes: {
      "*": [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        "node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node",
        " node_modules/@next/swc-linux-x64-musl/next-swc.linux-x64-musl.node",
        "node_modules/@esbuild/linux-x64",
      ],
    },
  },
};

module.exports = nextConfig;

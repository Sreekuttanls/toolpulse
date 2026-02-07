import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 15+: serverExternalPackages is at root
  serverExternalPackages: ['@huggingface/transformers', 'sharp', 'onnxruntime-node'],

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Force inclusion of ONNX binaries in Vercel Serverless Function
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/onnxruntime-node/bin/**/*.node',
      './node_modules/onnxruntime-node/bin/**/*.so*',
      './node_modules/sharp/**/*'
    ],
  },

  // Silence Turbopack error by providing empty config (allows Webpack fallback/coexistence)
  // This is required because we provide a custom 'webpack' function below.
  // @ts-ignore - The type definition might not be updated yet for this specific key in all versions
  turbopack: {},

  webpack: (config) => {
    // Ignore node-specific modules when bundling for the browser
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
};

export default nextConfig;

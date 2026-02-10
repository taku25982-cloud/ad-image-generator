import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Cloudflare Workers ローカル開発用の初期化
initOpenNextCloudflareForDev();

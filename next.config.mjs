/** @type {import('next').NextConfig} */
import pkg from "./package.json" with { type: "json" }

const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_GIT_SHA:
      process.env.GITHUB_SHA?.slice(0, 7) ??
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      "",
  },
}

export default nextConfig

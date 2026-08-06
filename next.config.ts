import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["smtp-server", "mailparser"],
}

export default nextConfig

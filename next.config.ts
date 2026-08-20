import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./src/messages/es.json",
  },
})

const nextConfig: NextConfig = {}

export default withNextIntl(nextConfig)

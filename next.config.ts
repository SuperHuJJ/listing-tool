import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // 必须保留，解决与 Turbopack 的兼容性问题
  turbopack: {},
};

export default withNextIntl(nextConfig);
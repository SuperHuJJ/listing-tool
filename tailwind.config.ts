import type { Config } from "tailwindcss";

const config: Config = {
  // v4 会自动检测文件，但明确指定 content 更稳健
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          600: "#2563eb", // 主蓝色
          700: "#1d4ed8",
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
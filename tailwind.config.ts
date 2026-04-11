import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // StatusBadge — dynamic classes assigned from a config object
    'bg-amber-50', 'text-amber-800', 'bg-amber-400',
    'bg-emerald-50', 'text-emerald-800', 'bg-emerald-500',
    'bg-red-50', 'text-red-800', 'bg-red-500',
    'bg-blue-50', 'text-blue-800', 'bg-blue-500',
    'bg-gray-100', 'text-gray-700', 'bg-gray-400',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config

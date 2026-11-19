import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// NEXT_PUBLIC_ is accepted too, so keys added by Vercel's Supabase integration work as-is.
export default defineConfig({ plugins: [react()], envPrefix: ['VITE_', 'NEXT_PUBLIC_'], test: { include: ['src/**/*.test.js'] } })

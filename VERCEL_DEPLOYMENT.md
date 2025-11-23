# Vercel Deployment Guide

This project is now configured to deploy automatically to Vercel.

## Automatic Deployment

1. **Connect your repository to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub/GitLab/Bitbucket repository
   - Vercel will automatically detect it's a Next.js project

2. **Environment Variables (Optional):**

   - The app will automatically detect the deployment URL
   - If you want to override, you can set `NEXT_PUBLIC_URL` in Vercel's environment variables
   - This is optional - the app works without it

3. **Build Settings:**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `bun install` or `npm install` (depending on your package manager)

## How It Works

The app uses a `getBaseUrl()` utility function that:

- **Client-side**: Uses `window.location.origin` automatically
- **Server-side**: Uses Vercel's `VERCEL_URL` environment variable (automatically provided)
- **Fallback**: Uses `NEXT_PUBLIC_URL` if set, or defaults to localhost for development

## FFmpeg WASM Files

The FFmpeg WebAssembly files in `public/download/` are automatically served as static assets by Vercel. No additional configuration needed.

## Deployment Checklist

- ✅ Environment variable handling (automatic URL detection)
- ✅ Static file serving (FFmpeg WASM files)
- ✅ Next.js build configuration
- ✅ Client and server-side URL resolution

## Troubleshooting

If you encounter issues:

1. **FFmpeg files not loading:**

   - Ensure `public/download/ffmpeg-core.js` and `ffmpeg-core.wasm` are committed to git
   - Check that they're being served correctly in the Vercel deployment

2. **Metadata URLs incorrect:**

   - The app should auto-detect, but you can set `NEXT_PUBLIC_URL` in Vercel's environment variables if needed

3. **Build errors:**
   - Ensure all dependencies are listed in `package.json`
   - Check that the build command runs successfully locally: `bun run build`

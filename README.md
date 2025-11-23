# Media Compression - Video & Image Compression Tool

![Media Compression](./public/banner.jpeg)

## Overview

Compress Videos & Convert Images for Free. Forever. Say goodbye to bulky files! Crush video sizes by up to 90% and convert images between multiple formats with no quality loss, even offline. All processing happens locally in your browser - your files never leave your device. And the best part? It's completely free and open-source!

## ✨ Features

### Video Compression

- **Compress videos** by up to 90% while maintaining quality
- **Convert between formats**: MP4, WebM, AVI, MOV, MKV, FLV, and more
- **Trim videos** by selecting start and end points
- **Remove audio** from videos if needed
- **Quality presets**: High, Medium, Low, and Custom options
- **Twitter-optimized compression** for social media sharing

### Image Conversion & Compression

- **Convert images** between formats: PNG, WebP, JPG, JPEG, GIF, BMP, AVIF
- **Compress images** while maintaining original format
- **Quality control** with customizable compression levels
- **Batch processing** - convert/compress multiple images at once

### Core Features

- 🚀 **100% Offline** - All processing happens in your browser
- 🔒 **Privacy First** - Your files never leave your device
- 💰 **Free Forever** - No limits, no subscriptions, no ads
- 🎨 **Modern UI** - Clean, intuitive interface
- ⚡ **Fast Processing** - Powered by FFmpeg WebAssembly

## ⛰️ Preview

<small>If preview is not loaded, please visit here [preview gif](./public/demo.gif).</small>

![Media Compression Preview](./public/demo.gif)

## 📋 Supported Formats

### Video Formats

- **Input**: MP4, M4V, MP4V, 3GP, 3G2, AVI, MOV, WMV, MKV, FLV, OGV, WebM, H264, 264, HEVC, 265
- **Output**: MP4, WebM, AVI, MOV, MKV, FLV

### Image Formats

- **Input**: PNG, JPG, JPEG, GIF, BMP, WebP, AVIF, SVG
- **Output**: PNG, WebP, JPG, JPEG, GIF, BMP, AVIF

## 🛠️ Technologies Used

- **Multimedia Framework:** [FFmpeg](https://ffmpeg.org/) (WebAssembly)
- **Framework:** [Next.js](https://nextjs.org) 14.1.0
- **Styling:** [Tailwind CSS](http://tailwindcss.com)
- **UI Components:** [Radix UI](https://www.radix-ui.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Package Manager:** [Bun](https://bun.sh/)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

### Running Locally

Ensure that you have Bun installed.

```bash
git clone https://github.com/mahdyarief/media-compress.git
cd media-compress
bun install
bun run dev
```

Create `.env.local` file similar to `.env.example` with your `NEXT_PUBLIC_URL` configuration.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_URL=http://localhost:3010
```

For production, set this to your deployed URL.

## 🌐 Live Demo

[Live Media Compression Tool](https://mediacompress.prolab.sh/)

## 📖 Usage

### Video Compression

1. Navigate to `/video` route
2. Upload your video file
3. Choose compression settings (quality, format, trim options)
4. Click compress and wait for processing
5. Download your compressed video

### Image Conversion/Compression

1. Navigate to `/image` route
2. Upload your image(s)
3. Choose mode: Convert or Compress
4. Select output format and quality settings
5. Click convert/compress and wait for processing
6. Download your processed image(s)

## 🎯 Use Cases

- **Content Creators**: Compress videos for faster uploads and sharing
- **Web Developers**: Optimize images for better website performance
- **Social Media**: Prepare content optimized for platforms like Twitter
- **Storage Optimization**: Reduce file sizes without quality loss
- **Format Conversion**: Convert media files for compatibility

## 🔒 Privacy & Security

- All processing happens **100% locally** in your browser
- Files are **never uploaded** to any server
- No data collection or tracking
- Open-source code for transparency
- Your privacy is guaranteed

## 📝 License

MIT License - See [LICENSE](./LICENSE) file for details.

You are free to use this code as inspiration. Please do not copy it directly. Crediting the author is appreciated. Please remove all personal information (images, etc.) when forking.

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mahdyarief/media-compress&type=Date)](https://star-history.com/#mahdyarief/media-compress&Date)

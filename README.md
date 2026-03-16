# CC0 Sounds Web

A modern, beautiful website for browsing and playing CC0 sound effects.

## Features

- Dark theme with accent color highlights
- Browse sound collections by folder
- Individual audio playback with waveform visualization
- Download individual sounds or entire collections
- Responsive design for all devices
- Fast static site generation with Astro

## Project Structure

```
cc0-sounds-web/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AudioPlayer.astro    # Audio player with play/download
│   │   ├── CollectionCard.astro  # Collection preview card
│   │   ├── Footer.astro          # Site footer
│   │   └── Header.astro          # Site header
│   ├── data/
│   │   └── collections.ts         # Collection metadata
│   ├── layouts/
│   │   └── BaseLayout.astro      # Base HTML layout
│   ├── pages/
│   │   ├── index.astro           # Homepage - collection list
│   │   └── collection/[id].astro # Collection detail page
│   └── types.ts                  # TypeScript types
├── scripts/
│   └── scan-audio.js             # Scan audio folders
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd cc0-sounds-web
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:4321 in your browser.

### Build

```bash
npm run build
```

The static files will be in the `dist` folder.

## Audio Folder Setup

The website expects audio files to be in folders relative to the project. You can either:

1. Copy or symlink your audio folders into the project
2. Configure the audio source path in the components

### Scanning Audio Folders

To scan your audio folders and generate metadata:

```bash
node scripts/scan-audio.js
```

This will output JSON with all collections and their files.

## Customization

### Colors

Edit CSS variables in `src/layouts/BaseLayout.astro`:

```css
:root {
  --color-accent: #00d4aa;
  --color-bg: #0a0a0f;
  /* ... */
}
```

### Adding Collections

Edit `src/data/collections.ts` to add or modify collection metadata.

## License

All audio files are CC0 licensed. The website code is MIT licensed.

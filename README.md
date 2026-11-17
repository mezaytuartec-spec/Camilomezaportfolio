# Camilo Meza Ytuarte — Thumbnail portfolio

A minimal, single-page portfolio of YouTube thumbnails: a liquid-glass logo
intro, then three rows of thumbnails that drift in alternating directions
(grab a row to move it by hand).

Built with React, TypeScript, Vite and Tailwind CSS v4.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

## Adding or removing thumbnails

Put the original images (PNG/JPG/WebP, 16:9) in one folder, then:

```bash
npm run thumbs -- "path/to/that/folder"
```

This regenerates `public/thumbs/` (two sizes each) and `src/lib/thumb-count.ts`.
Without an argument it reads the folder one level above the project.

## Where things are

- `src/App.tsx` — page layout and copy
- `src/components/marquee.tsx` — the three rows (auto-scroll + drag)
- `src/components/intro.tsx` — logo intro
- `src/components/ui/` — liquid-metal button and liquid-glass logo reveal
- `src/lib/contact.ts` — name, email, WhatsApp and Discord details
- `public/cursor.png`, `public/cursor@2x.png` — custom hand cursor

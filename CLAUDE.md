# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TokSlides is a web-based vertical presentation editor optimized for TikTok, Instagram Reels, and YouTube Shorts (9:16 format). Users create presentations in Markdown, apply themes, and export them as videos with webcam overlays.

## Development Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
```

## Architecture

### Core Flow
1. **Markdown Input** → Split by `---` into individual slides
2. **Slide Rendering** → Each slide rendered with theme styling via react-markdown
3. **Rasterization** → DOM snapshots captured to canvas using html-to-image (360x640 at 3x pixel ratio = 1080x1920 native)
4. **Video Composition** → Canvas composites slide + webcam overlay with masking
5. **Export** → MediaRecorder captures canvas stream as WebM/MP4

### State Management
All state lives in App.tsx using React hooks (useState, useRef, useEffect). No external state library.

- **Project persistence**: localStorage
- **Image assets**: IndexedDB via `utils/storage.ts` with `local://` URL scheme

### Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app logic, state, recording pipeline |
| `types.ts` | TypeScript interfaces (Theme, SlideData, Project, CameraShape) |
| `constants.ts` | Theme definitions and initial markdown template |
| `components/Preview.tsx` | Live slide preview with webcam overlay |
| `components/Editor.tsx` | Markdown editor with image paste support |
| `components/Sidebar.tsx` | Theme/layout selector and slide navigator |
| `utils/rasterizer.ts` | DOM-to-image wrapper for canvas composition |
| `utils/storage.ts` | IndexedDB wrapper for image persistence |

### Video Recording Pipeline

The recording system in App.tsx:
1. Rasterizes visible slide element via `rasterizeElement()`
2. Draws slide image to offscreen canvas
3. Composites webcam feed with shape masking (circle, square, rounded, portrait, landscape)
4. MediaRecorder captures canvas.captureStream()
5. Blob assembled and downloaded on stop

Canvas dimensions: 1080x1920 (mobile vertical format)

## Tech Stack

- React 19.2.3 with TypeScript 5.8
- Vite 6.2 (dev server, builds)
- Tailwind CSS via CDN
- html-to-image for DOM snapshots
- lucide-react for icons
- IndexedDB for local asset storage

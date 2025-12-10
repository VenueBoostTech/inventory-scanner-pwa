# Inventory Scanner (PWA)

Mobile-first Progressive Web App for warehouse inventory with barcode scanning, offline support, and stock operations. Built with React, TypeScript, Tailwind CSS, Vite, and shadcn/ui.

## Tech stack
- React 18 + TypeScript + Vite
- Tailwind CSS v3 + shadcn/ui + lucide-react
- State: React Query (server cache) + Zustand (client)
- Forms: React Hook Form + Zod
- Data/offline: axios, Dexie (IndexedDB), html5-qrcode (scanner), vite-plugin-pwa + workbox

## Prerequisites
- Node.js 18+
- Yarn classic (v1)

## Setup
```bash
yarn
yarn dev
```
Dev server: http://localhost:5173

### Environment
Create `.env.local` if you want a custom API base:
```
VITE_API_BASE_URL=https://api.example.com/inventory-app
```

## Scripts
- `yarn dev` – start dev server
- `yarn build` – type-check + build
- `yarn preview` – preview production build
- `yarn lint` – run ESLint

## PWA
- VitePWA configured in `vite.config.ts` (auto-update).
- Add icons to `public/`: `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`, `mask-icon.svg`.
- For camera access, serve over HTTPS or use localhost.

## Project structure (excerpt)
```
src/
  components/
    layout/          # AppShell, BottomNav, ScreenHeader
    ui/              # shadcn/ui components
  features/
    auth/            # Login/Profile screens
    scanning/        # Scan screen
    products/        # Products list screen
    activities/      # Activity list screen
  hooks/             # scanner, offline sync, react-query hooks
  lib/               # api client, Dexie db, utils
  stores/            # Zustand stores
  types/             # shared types
  App.tsx            # routing + providers
  index.css          # Tailwind base + design tokens
```

## Notes
- Tailwind uses design tokens in `index.css` and `tailwind.config.js` (safe-area spacing enabled).
- Default API base is a placeholder; set `VITE_API_BASE_URL` for real endpoints.
- Scanner uses `html5-qrcode` on element `#scanner` and requires camera permissions.***

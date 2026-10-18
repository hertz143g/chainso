# Chainso

Local MVP of the couple page experience built with Next.js.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current architecture

- Next.js app with a small `/api/music` metadata endpoint
- All user data stored locally in `localStorage`
- No account backend or database; music metadata is fetched from fixed public provider APIs
- If lookup is unavailable, song details can be entered manually

## Goal

Stabilize the local MVP UX first, then design a cleaner backend later if needed.

## Checks

```bash
npm run lint
npm test
npm run build
```

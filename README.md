# CAR-DEX / Car Spotter

This repository contains:
- `index.html` — a no-build GitHub Pages preview.
- `mobile/` — the real Expo/React Native mobile app.
- `server/` — the AI identification backend.

## GitHub Pages

GitHub Pages is configured to publish `main` → `/ (root)`.
Because `index.html` is at the repository root, this URL works:

`https://YOUR-USERNAME.github.io/Car-Dex/`

The Pages preview intentionally simulates AI identification so it can run as a static site. Uploaded photos become cards and cards persist in that browser via localStorage.

## Real app

The mobile app is under `mobile/` and the server is under `server/`.

See the previous README/setup comments in those folders. Never commit a real API key; use `.env` locally and keep it out of GitHub.

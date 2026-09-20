# CAR-DEX — Real AI Scanner

This version keeps the current CAR-DEX interface and adds:

- Real image-based vehicle identification through a secure backend.
- Structured vehicle identification fields.
- Conservative handling of uncertain specs (`Not verified` instead of invented precision).
- Garage delete buttons with confirmation.
- Garage persistence in browser local storage.
- 3D card flipping and the existing rarity/brand filtering.

## Files

- `index.html` — GitHub Pages frontend.
- `config.js` — one setting: your deployed Vercel API URL.
- `api/identify.js` — secure Vercel serverless endpoint.
- `vercel.json` — Vercel function configuration.

## Setup

### 1. Put the frontend on GitHub Pages

Upload/replace these files in the same GitHub Pages repository:

- `index.html`
- `config.js`

Keep GitHub Pages on `main` → `/ (root)`.

### 2. Deploy the backend on Vercel

Import the same GitHub repository into Vercel. Vercel will detect the `api/identify.js` serverless function.

In Vercel:

**Project → Settings → Environment Variables**

Add:

`OPENAI_API_KEY` = your OpenAI API key

Optional:

`OPENAI_MODEL` = `gpt-5.6-sol`

Do NOT put the OpenAI key in `index.html` or `config.js`.

After adding the variable, redeploy the Vercel project.

### 3. Connect GitHub Pages to Vercel

Vercel will give you a URL similar to:

`https://your-project-name.vercel.app`

Open `config.js` and change:

`PASTE_YOUR_VERCEL_URL_HERE/api/identify`

to:

`https://your-project-name.vercel.app/api/identify`

Commit/push that change to GitHub Pages.

### 4. Test

Use the supplied green BMW M3 photo as the first test.

Expected behavior:

1. Select/take a photo.
2. CAR-DEX shows the scan animation.
3. The photo is sent to the secure backend.
4. The vision model identifies the vehicle.
5. A collectible card is generated.
6. Tap the card to flip it.
7. Save it to Garage.
8. Delete it from Garage with the × button.

## Important accuracy note

Vision AI can identify the vehicle from visual evidence, but exact trim/year and production figures can be ambiguous from a single photo. CAR-DEX therefore tells the model to return `Not verified` instead of inventing a precise specification when the image does not support it.

A future vehicle-data verification layer can be added after this MVP is working.

## Security

Never commit an OpenAI API key to GitHub. Vercel environment variables are intended for server-side secrets.

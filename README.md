# PrintSmart

PrintSmart is a Next.js app for simplifying smart printing workflows across shopkeeper, customer, and admin experiences.

## Overview

This project uses the Next.js App Router in the `app/` directory and is styled with Tailwind CSS. It includes sections for:

- Public landing and dashboard pages
- Admin dashboard pages
- Shopkeeper login, onboarding, profile, settings, subscription, support, and order management pages
- Customer configuration, upload, coupon, language, review, order placed, and orders pages

## Tech Stack

- Next.js 14.2.35
- React 18.3.1
- React DOM 18.3.1
- Tailwind CSS 3.3.0
- PostCSS 8.4.31
- Autoprefixer 10.4.16
- lucide-react 0.293.0
- react-dropzone 14.2.3

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Requirements

- Node.js 18 or newer
- npm

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production Build

```bash
npm run build
npm run start
```

## Project Structure

- `app/` - App Router routes and layouts
- `public/` - Static assets
- `demo.html` - Demo page
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

## Updates in This Workspace

- Added App Router pages for admin, customer, and shopkeeper flows
- Included onboarding, pricing setup, profile setup, and dashboard components for the shopkeeper experience
- Configured Tailwind CSS for the UI layer
- Set up a lightweight icon and file upload stack with `lucide-react` and `react-dropzone`

## Push to GitHub

If the repository is already connected to GitHub:

```bash
git status
git add README.md
git commit -m "Add project README"
git push origin yash_main
```

If you need to connect the repo for the first time:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If your working branch is `yash_main`, push it directly with:

```bash
git push -u origin yash_main
```

## Notes

- The app uses the `app/` directory, not the legacy `pages/` directory.
- Keep the dependency versions in this README aligned with `package.json` when they change.
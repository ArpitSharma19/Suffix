# Client (Vite + React)

This is the public website and admin UI for Suffix, built with:
- React 19
- Vite 7
- React Router 7
- Bootstrap 5
- Font Awesome

## Getting Started

1. Install dependencies

```
npm install
```

2. Configure environment variables in client/.env

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3. Start the dev server

```
npm run dev
```

Open http://localhost:5173

## Available Scripts

- dev — start Vite dev server
- build — production build to dist
- preview — preview the build locally
- lint — run ESLint rules

## Project Structure

- src/
  - components/ — UI components (Navbar, Hero, About, Products, Success, ImageGrid, Footer)
  - components/admin — Admin pages and editors
  - pages/ — Home, AboutPage, DynamicPage and admin routes
  - services/api.js — Axios API wrapper (adds auth token if available)
  - utils/pageRegistry.js — Helpers for dynamic pages/sections
  - firebase.js — Firebase client initialization
  - App.jsx — Router + layout (Navbar/Footer)
  - App.css — Global styles and responsive utilities

## Routing and Scrolling

- The app uses React Router. The fixed navbar hides on scroll down and reappears on scroll up.
- Page navigation:
  - Navigating to a page: scrolls to top.
  - Navigating to a section (hash or submenu): scrolls the section directly under the fixed navbar (no gap), using runtime navbar height.

## Working With Content

- Content is fetched from the API via services/api.js.
- Dynamic pages use sections defined in the database (see server docs) and render composable blocks such as hero, about, products, solutions, imageGrid, and about-specific sections.

## Styling

- Bootstrap utility classes plus custom classes in App.css.
- Responsive breakpoints and utilities are defined for typography, spacing, and layouts.

## Production Build

```
npm run build
```

Outputs to dist/. In production, the Express server serves these files.

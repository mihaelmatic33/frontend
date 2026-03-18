# GitHub Copilot Instructions

## Project Overview
This is a React frontend application bootstrapped with **Create React App**. It serves as a Pokemon card / e-commerce and blog platform that consumes a **WordPress REST API** backend.

## Tech Stack
- **React 19** with functional components and hooks
- **React Router DOM v7** for client-side routing
- **Bootstrap 5** for responsive UI
- **FontAwesome** for icons
- **Swiper** for carousels/sliders
- **react-helmet-async** for SEO (meta tags)
- **EmailJS** for contact form submissions
- **WordPress REST API** (`https://front2.edukacija.online/backend/wp-json/`) as the data source

## Project Structure
```
src/
  App.js              # Root component with all routes
  CartContext.js      # Global cart state via React Context
  components/         # Reusable UI components (Nav, Footer, SEO, Loader, Toast, etc.)
  pages/              # Route-level page components
    admin/            # Admin panel pages (protected by JWT token in localStorage)
    shop/             # Shop and checkout pages
  img/                # Static images
```

## Conventions & Patterns
- **Functional components only** — no class components.
- **`useState` + `useEffect`** for local state and data fetching.
- **`fetch()`** is used directly (no axios or SWR).
- **JWT authentication**: the token is stored in `localStorage` under the key `"token"`. Admin routes check for its presence via `useEffect` + `useNavigate`.
- **SEO**: every page uses the custom `<SEO>` component (`src/components/SEO.js`) to set page title and description, populated from the WordPress Yoast metadata (`yoast_head_json`).
- **CSS**: each component/page has a companion `.css` file in the same directory. Global styles are in `App.css` and `index.css`.
- **Bootstrap classes** are used for layout (grid, flex utilities). Custom CSS overrides are kept minimal.
- **React Router `<Link>`** is used for internal navigation; `<a>` is used for external links.

## API Base URL
```js
const BASE_URL = "https://front2.edukacija.online/backend/wp-json/wp/";
```

## Key Files
- `src/App.js` — all route definitions
- `src/CartContext.js` — cart state and helpers
- `src/components/Nav.js` — main navigation bar
- `src/components/SEO.js` — meta tag helper
- `src/pages/admin/AdminLayout.js` — admin section layout with auth guard

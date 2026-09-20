# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication

Always respond, explain, and communicate with the user in Vietnamese (Tiếng Việt), across all sessions — regardless of the language the request is written in.

## Commands

- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — type-check (`tsc -b`), build with Vite, then prerender static routes via Puppeteer (`prerender.mjs`)
- `npm run lint` — run ESLint over the whole repo
- `npm run preview` — preview the production build locally

There is no test runner configured in this project (no test script, no test files).

To type-check without a full build, run `tsc -b` directly.

## Architecture

This is a React 18 + TypeScript + Vite SPA for an event management system (EMS), with two largely separate front-ends sharing one codebase: a public/user-facing site and an admin dashboard.

### Routing (`src/routes/`)

Routes are composed as `RouteObject` trees and merged with `useRoutes` in `src/routes/index.tsx`:
- `rootRedirect` sends `/` to `/vi`.
- `adminRoutes.tsx` — everything under `/admin`, gated by `AdminProtectedRoute` (`admin-protect-route.tsx`), which checks `state.auth` and only allows `ROLES.SUPER_ADMIN` / `ROLES.ORGANIZER` through (`ROLES.USER` sees a "forbidden" modal).
- `userRoutes.tsx` — the public site, nested under `LanguageLayout` (`src/layouts/LanguageLayout.tsx`) for both `/` (implicit `vi`) and `/:lang`. `LanguageLayout` syncs the URL's `:lang` param with i18next and redirects unsupported languages to `vi`. Authenticated-only user pages (`profile`, `my-tickets`, event moments) are further wrapped in `protect-routes.tsx`.
- All page-level route components are `React.lazy`-loaded.
- When adding a new public page, it must go under the `/:lang` (and usually also the bare `/`) branch to stay reachable from both language forms; when adding an admin page, add it to `adminRoutes.tsx` inside the `AdminTemplate` children.

### State (`src/store/`)

Redux Toolkit store (`src/store/index.ts`) with one slice per domain (`auth`, `events`, `presenters`, `organizers`, `activities`, `news`, `notifications`, `categories`, users). Slice conventions to follow when extending or adding one:
- Data fetching/mutation is done via `createAsyncThunk`, calling `apiService` and returning `rejectWithValue(err.response?.data?.message || err.message)` on failure.
- Most slices reset their state to `initialState` on `logoutUser.fulfilled` (imported from `./auth`) — replicate this in new slices that hold user-specific data.
- Image/file URLs coming from the backend are often relative; slices normalize them against the API root (strip the `/api` suffix from `VITE_API_BASE_URL`) — see `processImageUrl`/`getBackendRootUrl` in `eventSlice.ts` for the pattern.

### API layer (`src/services/apiService.ts`)

A single Axios instance wraps all HTTP calls:
- Base URL comes from `VITE_API_BASE_URL`, falling back to the deployed backend (`https://event-app-y77p.onrender.com/api`).
- Request interceptor attaches `Authorization: Bearer <token>` from `localStorage[STORAGE_KEYS.ACCESS_TOKEN]` (constants in `src/constants/index.ts`).
- Response interceptor unwraps `response.data` automatically — thunks/components receive the payload directly, not an Axios response.
- A 401 response clears the stored token and hard-redirects to `/auth`, unless already there.
- `apiServiceExport` (the default export) exposes typed `get/post/put/delete/patch` helpers; use these instead of importing axios directly elsewhere.

### Auth flow

Two login paths feed the same token storage (`localStorage[STORAGE_KEYS.ACCESS_TOKEN]`, a JWT):
1. Normal in-app login writes the token directly.
2. OAuth/redirect login lands back on the app with `?token=`/`?accessToken=`/`?refreshToken=` query params — `AuthHandler` in `src/App.tsx` validates the token looks like a JWT (3 dot-separated parts), stores it, strips the query string, and reloads.

On every app load (`AppContent` in `src/App.tsx`), a stored token triggers `fetchCurrentUser()` to populate `state.auth`; an invalid/malformed token is discarded. Role checks throughout the app compare `user.role` against `ROLES` (`SADMIN`, `ORGANIZER`, `USER`) from `src/constants/index.ts`.

### Internationalization

`i18next` + `react-i18next` (`src/i18n.ts`) with `vi` (default/fallback) and `en` locale JSON files. Language is driven by the `:lang` URL segment via `LanguageLayout`, not just browser detection — when adding user-facing text, add keys to both locale files and route new pages so they're reachable under `/:lang`.

### Prerendering & SEO

`npm run build` runs `prerender.mjs` after the Vite build: it serves `dist/` locally, drives it with Puppeteer for a fixed list of routes (`/`, `/about`, `/value`, `/events`, `/news`), and overwrites each route's `index.html` with the fully-rendered DOM (for crawlers/SEO). If you add a new top-level public route, add it to the `ROUTES` array in `prerender.mjs` and consider `vite-plugin-sitemap`'s `dynamicRoutes`/`robots.disallow` config in `vite.config.ts`.

### Path aliasing & structure conventions

- `@/*` resolves to `src/*` (configured in `vite.config.ts` and `tsconfig`). Both `@/`-alias and relative imports appear in the codebase; prefer `@/` for new code outside the immediate directory.
- Page-local, non-shared components live under a page's `_components/` subfolder (e.g. `src/pages/HomeTemplate/_components/...`, `src/pages/AdminTemplate/_components/...`); truly shared components live in `src/components/`.
- Redux slices live in `src/store/slices/`; domain types in `src/models/`.

### Notifications

Real-time notifications use STOMP over SockJS (`@stomp/stompjs`, `sockjs-client`); see `src/pages/HomeTemplate/EventPage/EventMomentsPage.tsx` and `src/hooks/useUserNotifications.ts` for the pattern, and `notificationSlice.ts` for the corresponding Redux state.

## Notes

- ESLint has `@typescript-eslint/no-explicit-any` and several `react-hooks` rules turned off — `any` is used pervasively (especially in API payloads and thunk error handling); don't try to eliminate it wholesale.
- Many UI strings, comments, and toast messages are in Vietnamese — match the existing language when editing a file rather than switching it to English.

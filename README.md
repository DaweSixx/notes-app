# Notes

A small SPA for notes with todo lists: a list of notes on the home page and an editor with undo/redo, drafts and cross-tab sync.

## Stack

- Nuxt 4 (SPA mode), Vue 3 Composition API, TypeScript (strict)
- Pinia
- SCSS, no UI libraries
- @nuxtjs/i18n — English and Russian, picked from the browser language
- Vitest

## Docker

```bash
docker-compose up
```

The app is served at http://localhost:8080. The image build runs the unit tests and the type check, then serves the static build with nginx.

## Requirements

- Node.js 20 or newer
- pnpm 11

## Setup

```bash
pnpm install
```

## Commands

```bash
pnpm dev                  # dev server at http://localhost:3000
pnpm build                # production build
pnpm preview              # preview the production build
pnpm generate             # static build into .output/public
pnpm test                 # unit tests
pnpm exec nuxi typecheck  # type check
```

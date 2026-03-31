# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

- **Install dependencies**: `npm install`
- **Run development (Electron)**: `npm run dev`
- **Build production**: `npm run build`
- **Lint**: `npm run lint`
- **Run all tests**: `npm run test`
- **Run a single test**: `npx jest path/to/test.ts`

## Architecture

- **Electron app** with renderer (React/TypeScript) and main process
- **Renderer source**: `src/renderer/` — React components, hooks, services
- **Main process**: `src/main/` — Electron main process, IPC handlers
- **Locales**: `src/renderer/locales/{lang}/core.json` — i18n translations (i18next with `core` namespace)
- **Extensions**: loaded from `release/app/node_modules/@tagspaces/extensions/`
- **Perspectives**: different views for folder content (Grid, List, Kanban, Gallery, Mapique, FolderViz, Calendar)
- **State management**: Redux with slices in `src/renderer/reducers/`

## Translations / i18n

- English source: `src/renderer/locales/en/core.json`
- All translation keys use the `core:` namespace prefix in code (e.g., `t('core:achieveMore')`)
- When translating, preserve template variables exactly: `{{fileName}}`, `{{version}}`, etc.
- Technical terms stay in English across all locales: TagSpaces, Kanban, Markdown, HTML, S3, WebDAV, AI, URL, QR, EXIF, FolderViz, Mapique
- **German (de_DE)**: Use "Tags" for tags, NOT "Schlagwort/Schlagwörter". The English loanword "Tags" is the project standard for German.

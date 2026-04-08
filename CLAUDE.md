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

## E2E Tests

### Setup
- **Framework**: Playwright with Electron and Chromium (web)
- **Test files**: `tests/e2e/*.pw.e2e.js` — test titles contain platform tags like `[web,s3,electron,_pro]`
- **S3 backend**: S3Proxy (Java, requires Java 21) replaces the old MinIO/S3rver setup
- **S3Proxy JAR**: `tests/s3proxy.jar` (not committed, downloaded in CI or locally via `curl`)
- **S3Proxy config**: Generated per-worker at runtime in `tests/setup-functions.js`
- **Test data**: Cloned from `tagspaces/testdata` repo into `tests/testdata/`; per-worker copies in `tests/testdata-{N}/`

### Running tests locally
```bash
# Requires Java 21 on PATH
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"  # macOS with Homebrew

# Download S3Proxy JAR (once)
curl -sL -o tests/s3proxy.jar "https://repo1.maven.org/maven2/org/gaul/s3proxy/3.0.0/s3proxy-3.0.0-jar-with-dependencies.jar"

# Build for e2e first
npm run build-e2e        # Electron
npm run build-e2e-web    # Web

# Run test suites
npm run test-playwright-s3              # Electron + S3
npm run test-playwright-web-headless    # Web + S3

# Run a single test
npx playwright test --project=electron-s3 -g 'TST0101'
npx playwright test --project=web-s3 -g 'TST0101'

# Run a specific test file
npx playwright test --project=electron-s3 folder.pw.e2e.js
```

### Key patterns and pitfalls
- **Workers = 1**: Tests run sequentially. Running multiple Playwright instances in parallel causes port conflicts on S3Proxy (port 4569).
- **Test isolation**: Tests share a single Electron/browser instance per worker. Earlier tests can leave dirty state (renamed files, moved folders, tags) that breaks later tests. When a test fails, check if it passes in isolation first (`-g 'TSTXXXX'`).
- **S3 test data refresh**: `testDataRefresh()` in `hook.js` deletes all S3 objects and re-uploads. Uses individual `DeleteObjectCommand` (not batch `DeleteObjectsCommand`) because S3Proxy's filesystem backend throws `DirectoryNotEmptyException` on batch deletes when parent directories still contain children. Objects are sorted deepest-first before deletion.
- **S3Proxy config essentials**: `s3proxy.ignore-unknown-headers=true` (AWS SDK v3 sends `x-amz-checksum-crc32` headers), `s3proxy.cors-allow-all=true` (required for web tests), `jclouds.provider=filesystem-nio2`.
- **Confirm dialogs**: The app uses `window.confirm()` for some operations (e.g., thumbnail overwrite). Handle with `global.client.once('dialog', (dialog) => dialog.accept())` **before** the triggering action.
- **S3 limitations**: Some features don't work on S3 locations — thumbnail generation for ODT/ODS/EPUB/TIFF, folder thumbnail set/clear (`setAsThumbTID`), sublocation listing. Keep these tests tagged `[electron,_pro]` without `s3`.
- **Timeouts**: S3 operations are slower than local filesystem. Use 10-15s for element existence checks on S3 (vs 5s local). The `createLocation` helper uses 30s for folder existence after opening a new location.

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
- **S3 test data refresh**: `testDataRefresh()` in `hook.js` deletes all S3 objects and re-uploads from the **original** test data source (`tests/testdata/`), not from the worker copy. This is critical because `deleteAllObjects` wipes the S3Proxy filesystem backend which IS the worker copy (`testdata-{N}/`). Uses `Promise.allSettled` because S3Proxy can return malformed XML responses that cause AWS SDK deserialization errors. Empty directories (like `empty_folder`) need explicit directory markers since `getFilesRecursive` only finds files.
- **S3Proxy config essentials**: `s3proxy.ignore-unknown-headers=true` (AWS SDK v3 sends `x-amz-checksum-crc32` headers), `s3proxy.cors-allow-all=true` (required for web tests), `jclouds.provider=filesystem-nio2`.
- **Confirm dialogs**: The app uses `window.confirm()` for some operations (e.g., thumbnail overwrite). Handle with `global.client.once('dialog', (dialog) => dialog.accept())` **before** the triggering action.
- **S3 limitations**: Some features don't work on S3 locations — thumbnail generation for ODT/ODS/EPUB/TIFF, folder thumbnail set/clear (`setAsThumbTID`), sublocation listing, open file natively (`fileMenuOpenFileNatively`), open containing folder (`fileMenuOpenContainingFolder`). Keep these tests tagged `[electron,_pro]` or `[electron]` without `s3`.
- **Timeouts**: S3 operations are slower than local filesystem. Use 15s for `empty_folder` existence checks in `beforeEach` on S3. The `createLocation` helper uses 30s for folder existence after opening a new location.
- **TagSpaces Pro source**: The `tagspacespro/` directory is a separate module loaded from `node_modules/@tagspacespro/`. When fixing Pro code (e.g., Kanban perspective), edit **both** `tagspacespro/` and `node_modules/@tagspacespro/tagspacespro/` — webpack compiles from `node_modules`. Rebuild with `npm run build-e2e` after Pro source changes.
- **`clickOn()` throws on failure**: The `clickOn()` helper in `general.helpers.js` re-throws errors after logging. This means failed clicks will fail the test immediately rather than silently continuing.
- **`openContextEntryMenu()` waits for menu**: The helper waits for the menu item to be visible (5s) before clicking, reducing flakiness from context menu render timing.
- **MUI `sx` prop and attribute monitoring**: MUI's `sx` prop generates dynamic CSS class names, not inline `style` attributes. When testing visual changes (e.g., background color), poll the `class` attribute with `waitUntilChanged()`, not `style`.
- **Kanban `getDirectoryMenuItems` parameter order**: If the `DirectoryMenuItems.tsx` function signature changes (new parameters added), all callers must be updated — especially `ColumnMenu.tsx` in tagspacespro which uses positional arguments. A misaligned parameter shifts all subsequent callbacks into wrong slots.

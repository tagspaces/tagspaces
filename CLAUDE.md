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

## tagspaces-common Monorepo (`../tagspaces-common`)

Lerna-managed monorepo (`packages/*`) providing shared libraries. Version 4.6.1. Key packages:

### @tagspaces/tagspaces-common (`packages/common`)

Core utilities used across all packages and the main app.

- **AppConfig.js** — Central constants: `metaFolder: ".ts"`, `metaFolderFile: "tsm.json"`, `folderIndexFile: "tsi.json"`, `folderThumbFile: "tst.jpg"`, tag delimiters (`[`, `]`, space), platform detection flags
- **paths.js** — Cross-platform path utilities (27KB). Key functions:
  - `extractFileName`, `extractFileExtension`, `extractFileNameWithoutExt`, `extractContainingDirectoryPath`
  - `generateFileName(fileName, tags, delimiter)` — embed tags: `name[tag1 tag2].ext`
  - `extractTags(filePath)` — parse tags from filename brackets
  - `getMetaFileLocationForFile(path)` → `.ts/{filename}.json`
  - `getMetaFileLocationForDir(path)` → `.ts/tsm.json`
  - `getThumbFileLocationForFile(path)` → `.ts/{filename}.jpg`
  - `cleanTrailingDirSeparator`, `cleanRootPath`, `normalizePath`, `joinPaths`
- **utils-io.js** — IO abstractions: `walkDirectory(param, listDirectoryPromise, options, ...)` for recursive traversal with callbacks, `extractTextContent`, `extractHTMLText`, `extractMarkdownText`, `createTextIndex`
- **misc.js** — Sorting (`sortByName`, `sortBySize`, `sortByDateModified`, `sortByExtension`, `sortByFirstTag`), link extraction (`extractLinks` — handles HTML href, markdown, plain URLs, `ts://` protocol), date formatting, `b64toBlob`, `streamToBuffer`

### @tagspaces/tagspaces-indexer (`packages/indexer`)

Creates searchable directory indexes stored as `.ts/tsi.json`.

- `createIndex(param, mode, ignorePatterns, isWalking)` — Main function. Modes: `["loadMeta", "extractTextContent", "extractLinks", "extractThumbPath"]`. Recursively walks directory, skips `.ts` and dot-hidden folders
- `persistIndex(param, directoryIndex)` — Saves to `.ts/tsi.json`
- `loadIndex(param)` / `hasIndex(param)` — Load or check existing index
- **Index entry structure**: `{ name, path (relative), uuid, isFile, size, lmdt, meta: { tags, color, description }, textContent, links }`
- The `param` object carries `path`, `listDirectoryPromise`, `getFileContentPromise`, and optionally `extractPDFcontent`

### @tagspaces/shell (`packages/tagspaces-cli`)

CLI tool (`tscmd`) for batch file operations. Built with yargs + webpack. See the sub-project readme for details.

Dependencies: `@tagspaces/tagspaces-indexer`, `@tagspaces/tagspaces-workers` (thumbnails), `@tagspaces/tagspaces-metacleaner`.

### @tagspaces/tagspaces-ws (`packages/tagspaces-ws`)

HTTP server (localhost-only) providing REST API for indexing and thumbnail generation. Used by the Electron main process to offload heavy work.

- **Start**: Listens on `127.0.0.1:<port>` (default 40352), optional JWT auth key
- **POST /thumb-gen** — Body: JSON array of file paths. Query: `?pdf=true`. Returns thumbnail metadata
- **POST /indexer** — Body: `{ directoryPath, extractText, extractLinks, ignorePatterns }`. Creates `.ts/tsi.json`
- **POST /extract-pdf** — Body: `{ filePath }`. Extracts PDF text content
- **POST /watch-folder** — Body: `{ directoryPath }`. Monitors filesystem changes
- **POST /hide-folder** — Body: `{ directoryPath }`. Marks folder as hidden
- **GET /** — Health check

Dependencies: `@tagspaces/tagspaces-indexer`, `@tagspaces/tagspaces-workers`, `@tagspaces/tagspaces-pdf-extraction`, `ws`, `jsonwebtoken`. Peer: `sharp` >=0.32.0.

### Supporting packages

- **@tagspaces/tagspaces-common-node** (`packages/common-node`) — Node.js `fs` implementation: `listDirectoryPromise`, `loadTextFilePromise`, `saveTextFilePromise`, `renameFilePromise`, `createDirectoryPromise`, `getDirProperties`
- **@tagspaces/tagspaces-workers** — Thumbnail generation using `sharp` (JPG, PNG, GIF, WebP, SVG, PDF, video)
- **@tagspaces/tagspaces-metacleaner** — Finds/removes orphaned `.ts/*.json` and thumbnails for deleted files
- **@tagspaces/tagspaces-pdf-extraction** — PDF text extraction for indexing

### Metadata filesystem layout

```
folder/
├── file.txt
├── .ts/                    # Metadata folder (AppConfig.metaFolder)
│   ├── tsm.json            # Folder metadata (tags, color, description, perspective)
│   ├── tsi.json            # Search index (array of indexed entries)
│   ├── tst.jpg             # Folder thumbnail
│   ├── tsb.jpg             # Folder background image
│   ├── file.txt.json       # File sidecar metadata
│   └── file.txt.jpg        # File thumbnail
```

### Package dependency graph

```
tagspaces-common (core: paths, utils-io, misc, AppConfig)
  ↓
tagspaces-indexer (uses common + IO provider)
  ↓
tagspaces-cli (uses indexer + workers + metacleaner)
tagspaces-ws  (uses indexer + workers + pdf-extraction)
  ↓
tagspaces-common-node (Node.js fs implementation, injected as IO provider)
```

## Indexing & Search

### Architecture

- **Core logic** lives in `tagspaces-common`. See [../tagspaces-common/CLAUDE.md](../tagspaces-common/CLAUDE.md) for the indexing format (tsi.json + tsft.jsonl), CJK tokenization, PDF extraction details, etc.
- **Renderer integration**: `src/renderer/hooks/LocationIndexContextProvider.tsx` — orchestrates create/load/search. Two code paths:
  - **Worker path**: Electron-only. Renderer → IPC → Electron main → HTTP POST to local WS server (pm2-managed). Used when `isWorkerAvailable() && enableWS && !objectStore && !webdav && !nativeMobile`.
  - **Non-worker path** (`createNotWorkerIndex`): Everything else — S3, WebDAV, Cordova, Capacitor, web app, and Electron with WS disabled. Runs in renderer thread.
- **Search logic** lives in `@tagspaces/tagspaces-search` (pure JS, works on all platforms). The renderer's `src/renderer/services/search.ts` is a thin wrapper.

### Renderer gotchas

- **`createNotWorkerIndex` must inject `extractPDFcontent`** into the `indexParam` when `extractText` is true — imported from `src/renderer/services/thumbsgenerator.ts` (which uses pdfjs-dist). Without it, PDFs in S3/mobile/non-worker locations get no fulltext.
- **Fulltext lazy loading** (`loadFullTextIfNeeded`): only runs when `searchQuery.textQuery` is present and the index isn't already loaded. Must convert `tsft.jsonl` keys from relative→absolute paths before calling `mergeFullTextIntoIndex`.
- **Caches** (`enhancedIndex.current`, `fuseInstance.current`, `fullTextMap.current`) must all be invalidated together in `setIndex`. Missing any one causes stale search results.
- **Progress feedback**: `createIndex` and `createIncrementalIndex` accept an `onProgress({count, entry})` callback. The renderer throttles updates to 250ms to avoid flooding React with re-renders.

### Local dev: syncing changes to node_modules

When editing files in `../tagspaces-common/packages/*`, they must be copied to **both** locations:
- `node_modules/@tagspaces/*` — used by the renderer (webpack bundle)
- `release/app/node_modules/@tagspaces/*` — used by the Electron main process and WS worker

```bash
# Example for indexer changes:
cp ../tagspaces-common/packages/indexer/indexer.js \
   node_modules/@tagspaces/tagspaces-indexer/indexer.js
cp ../tagspaces-common/packages/indexer/indexer.js \
   release/app/node_modules/@tagspaces/tagspaces-indexer/indexer.js
```

`@tagspaces/tagspaces-search` is symlinked in both locations (single source of truth). `@tagspaces/tagspaces-ws` must be rebuilt (`cd ../tagspaces-common/packages/tagspaces-ws && npm run build:dev`) — the build produces `build/index.js` + `build/vendors-*.js` chunk + `build/pdf.worker.mjs` (copied by an inline webpack plugin). All three files must go to `release/app/node_modules/@tagspaces/tagspaces-ws/build/`.

### CLI for ad-hoc indexing/searching

```bash
node ../tagspaces-common/packages/tagspaces-cli/bin/clidev.js indexer -f /path/to/folder  # with fulltext
node ../tagspaces-common/packages/tagspaces-cli/bin/clidev.js search /path/to/folder -q "query"
```

CLI has incremental indexing: subsequent runs skip unchanged files (see `+added ~modified -deleted =unchanged` stats). `--force` triggers a full re-index.

## Path Handling

The app runs on multiple platforms and storage backends. When working with file/directory paths, always consider all three cases:

- **Mac/Linux local**: Absolute paths with leading `/` (e.g., `/Users/username/Documents/`)
- **Windows local**: Drive-letter paths with `\` separators (e.g., `C:\Users\username\Documents\`). Java `.properties` files treat `\` as escape characters — always convert to `/` when writing paths to config files.
- **S3/cloud**: Forward-slash paths, often without a leading `/` (e.g., `bucket-name/folder/`). No drive letter, no OS-specific separator.

When comparing paths (e.g., `startsWith`, equality checks), normalize **both** sides with the same functions. A common bug pattern: applying `cleanFrontDirSeparator` (strips leading `/`) to one path but not the other, breaking the comparison on Mac/Linux where absolute paths start with `/`. Path utilities live in `@tagspaces/tagspaces-common/paths.js`.

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
- **TagSpaces Pro source**: Before editing Pro code in `tagspacespro/`, run `cd tagspacespro && npm run link4dev` to symlink it into `node_modules/@tagspacespro/`. Webpack compiles from `node_modules/@tagspacespro/`, so the symlink ensures edits to `tagspacespro/` are picked up. Rebuild with `npm run build-e2e` after Pro source changes.
- **`clickOn()` throws on failure**: The `clickOn()` helper in `general.helpers.js` re-throws errors after logging. This means failed clicks will fail the test immediately rather than silently continuing.
- **`openContextEntryMenu()` waits for menu**: The helper waits for the menu item to be visible (5s) before clicking, reducing flakiness from context menu render timing.
- **MUI `sx` prop and attribute monitoring**: MUI's `sx` prop generates dynamic CSS class names, not inline `style` attributes. When testing visual changes (e.g., background color), poll the `class` attribute with `waitUntilChanged()`, not `style`.
- **Kanban `getDirectoryMenuItems` parameter order**: If the `DirectoryMenuItems.tsx` function signature changes (new parameters added), all callers must be updated — especially `ColumnMenu.tsx` in tagspacespro which uses positional arguments. A misaligned parameter shifts all subsequent callbacks into wrong slots.

## Capacitor Mobile App

### Structure

- **Capacitor project**: `capacitor/` (parallel to `cordova/`, both can coexist)
- **IO package**: `@tagspaces/tagspaces-common-capacitor` (source: `../tagspaces-common/packages/common-capacitor/`)
- **Webpack configs**: `.erb/configs/webpack.config.capacitor.prod.ts` / `.dev.ts`
- **Custom plugins**: `capacitor/android/app/src/main/java/org/tagspaces/plugins/` (StoragePermission, IntentHandler)
- **Platform detection**: `AppConfig.isCapacitor`, `AppConfig.isCapacitorAndroid`, `AppConfig.isCapacitoriOS`, `AppConfig.isNativeMobile` (unified Cordova+Capacitor flag)

### Build & Run

```bash
npm run prepare-capacitor        # Copy extensions + node_modules to www/
npm run build:capacitor          # Webpack production build
cd capacitor && npx cap sync     # Sync web assets + plugins to native projects
npm run run-android-cap          # Full pipeline: prepare + build + sync + run
npm run run-ios-cap              # Same for iOS
cd capacitor && npx cap open android  # Open in Android Studio
cd capacitor && npx cap open ios      # Open in Xcode
```

### Local Development Symlinks

The `@tagspaces/tagspaces-common` and `@tagspaces/tagspaces-common-capacitor` packages in `release/app/node_modules/` must be symlinked to the source repos, otherwise `npm install` or `prepare-capacitor` overwrites Capacitor detection code:

```bash
ln -s /path/to/tagspaces-common/packages/common release/app/node_modules/@tagspaces/tagspaces-common
ln -s /path/to/tagspaces-common/packages/common-capacitor release/app/node_modules/@tagspaces/tagspaces-common-capacitor
ln -s /path/to/tagspaces-common/packages/common-capacitor node_modules/@tagspaces/tagspaces-common-capacitor
```

### Key Pitfalls

- **Extension paths**: `prepare-capacitor` must copy `node_modules` directly to `capacitor/www/` (not into a subdirectory). Extensions are loaded as `node_modules/@tagspaces/extensions/{ext}/index.html` in iframes.
- **File URLs**: Native file paths must go through `Capacitor.convertFileSrc()` to be loadable in WebView (`<img>`, iframes). Applied in `CommonLocation.normalizeUrl()`.
- **Empty path = "."**: `resolveCapacitorPath()` in `io-capacitor.js` must return `"."` not `""` for root directories. Capacitor Filesystem fails silently with empty string.
- **CSP must include `capacitor:` scheme**: In `frame-src`, `img-src`, `default-src`, `media-src`. Without it, thumbnails and extension iframes won't load.
- **No `deviceready` event**: Capacitor bridge is ready immediately. `onDeviceReady()` is called via `setTimeout(..., 0)` at module load time.
- **Safe area / notch**: Use `StatusBar.setOverlaysWebView({ overlay: false })` programmatically. CSS `env(safe-area-inset-*)` is unreliable on Android. The `<body>` inline `padding:0` overrides CSS — use `!important`.
- **Android storage**: Uses `MANAGE_EXTERNAL_STORAGE` permission (file manager exemption). Runtime check via custom `StoragePermissionPlugin`. Play Store requires justification.
- **iOS locations**: Sandboxed to Documents + iCloud only. Enable `UIFileSharingEnabled` in Info.plist for Files app visibility.

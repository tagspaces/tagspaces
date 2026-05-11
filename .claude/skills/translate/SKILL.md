---
name: translate
description: Translate new or untranslated i18n strings from the English locale files (core.json + peri.json) into all other locales, maintaining consistency with each language's existing translations.
---

# Translate Skill

Automatically translate new or untranslated strings from the English locale files to all other locale files, maintaining consistency with each language's existing translations.

The app uses **two i18next namespaces**, each backed by its own JSON file per locale:

- `core` → `core.json` (main app strings, default namespace)
- `peri` → `peri.json` (peripheral content: onboarding `ob*`, help-tour `hts*`, Pro teaser slides `pts*`, months / weekday abbreviations, `proTeaser*Headline`/`Subtext`)

Both files are flat key-value JSON with no nesting (`keySeparator: false`).

## Arguments

- No argument or `all`: process all languages and **both** namespaces.
- A language code (e.g., `de_DE`, `ja`, `bg`): process only that language; both namespaces.
- A namespace name (`core` or `peri`): process all languages but only that namespace.
- `lang=<code>` and/or `ns=<core|peri>` (any order, comma-separated): scope the run.
   - e.g. `lang=de_DE,ns=peri`, `ns=peri`, `lang=ja`
- `report`: only show what's missing/untranslated, don't translate. Combinable with `lang=`/`ns=`.

## File Paths

- **Sources of truth**: `src/renderer/locales/en/core.json` and `src/renderer/locales/en/peri.json`
- **Target locales**: every subdirectory of `src/renderer/locales/` except `en/`
- Each locale should contain both `core.json` and `peri.json` (flat key-value JSON, no nesting). If `peri.json` is missing for a locale, generate it from scratch.

## Step 1 — Detect what needs translating

For **each namespace** in scope (default: both `core` and `peri`):

1. Read the English source file (`src/renderer/locales/en/<ns>.json`).
2. List all directories under `src/renderer/locales/` to discover target languages.
3. If a specific language was requested, only process that one; otherwise process all.
4. For each target locale, read `src/renderer/locales/<lng>/<ns>.json` and compare against English:
   - **Missing keys**: present in English but absent in the target file. (If the target file itself is missing, treat every English key as missing.)
   - **Untranslated keys**: value in the target is identical to the English value AND the key is NOT in the skip-list (see below).
   - **Orphan keys**: present in the target but absent from English (candidates for removal).
5. Print a summary table per namespace:
   ```
   [ns=peri]
   Language  | Missing | Untranslated | Orphan
   ----------|---------|--------------|-------
   de_DE     |    3    |      1       |   0
   ja        |    3    |      5       |   0
   ...
   ```
6. If the argument was `report`, stop here. Otherwise, ask the user for confirmation before proceeding (unless `--yes` was passed).

### Skip-list for untranslated detection

These keys are expected to have the same value as English in many/all languages. Do NOT flag them as untranslated:

- Keys where the English value is a single symbol, number, or punctuation (e.g., `"-"`, `"/"`)
- Keys where the English value is a proper noun or brand name only (e.g., `"TagSpaces"`, `"Mapique"`)
- Keys where the English value is a widely-used English loanword that many languages keep as-is (e.g., `"Ok"`, `"Email"`, `"Kanban"`)
- When in doubt, check if at least 5 other languages also have the same value as English — if so, it's likely intentional.

## Step 2 — Gather translation context

For each (language, namespace) pair that needs translations:

1. Read the target file for that language and namespace, **plus the same locale's other namespace file** (e.g. when translating `peri.json`, also read `core.json` for context). This is critical because `peri.json` is small (~142 keys) and won't carry enough style signal on its own.
2. Select a **context sample** of ~50 existing translated key-value pairs drawn from both namespaces. Prioritize:
   - Strings thematically similar to the ones being translated (e.g., if translating onboarding slides, sample any existing onboarding-adjacent strings; if translating Pro teaser copy, sample existing marketing/feature descriptions).
   - A mix of short labels and longer descriptive strings to capture both terse and verbose style.
3. This sample will be used as a **style and terminology reference** when translating, ensuring:
   - Consistent tone and formality level (formal "Sie" vs informal "du" in German, etc.)
   - Consistent term choices (e.g., if "folder" has been translated as "Ordner" in German, keep using "Ordner")
   - Consistent punctuation patterns

## Step 3 — Translate

For each (language, namespace) pair, translate all missing and untranslated keys:

1. Use the English value as the source text.
2. Reference the context sample from Step 2 for style/terminology consistency.
3. Apply the following rules strictly:

### Translation Rules

- **NEVER modify `en/core.json` or `en/peri.json`** — both are read-only for this skill.
- **Preserve `{{variables}}` exactly** — template placeholders like `{{fileName}}`, `{{version}}`, `{{count}}`, `{{folderName}}` must appear in the translation unchanged. Do not translate, reorder, or remove them.
- **Preserve HTML tags exactly** — tags like `<br>`, `<b>`, `</b>`, `<a>` etc. must remain intact.
- **Keep technical terms in English** across all languages: TagSpaces, Kanban, Markdown, HTML, S3, WebDAV, AI, URL, QR, EXIF, FolderViz, Mapique, JSON, PDF, EPUB, CSV, ZIP, GPX, KML, Pro.
- **German (de_DE) specific**: Use "Tags" for tags, NOT "Schlagwort/Schlagwörter". The English loanword "Tags" is the project standard.
- **Match existing tone**: If a language uses formal address (e.g., "Sie" in German, "Vous" in French), maintain that. If informal, maintain that. Determine this from the existing translations.
- **Natural phrasing**: Translations should read naturally in the target language, not be word-for-word calques from English.
- **Translate language by language** (not key by key) to maintain internal consistency within each locale. Within a language, finish one namespace before starting the next so style stays unified across both files.

## Step 4 — Write results

For each modified locale + namespace:

1. Construct the full target JSON with:
   - **The same key order as the matching English file** (`en/core.json` for core, `en/peri.json` for peri). This keeps diffs clean and structure consistent.
   - All existing translations preserved (only missing/untranslated keys get new values).
   - Orphan keys removed (keys not present in the corresponding English file).
2. Write the file using the Write tool or Edit tool as appropriate. End the file with a single trailing newline (matches existing files).
3. **Validate JSON**: After writing, verify the file is valid JSON (use `node -e "JSON.parse(require('fs').readFileSync('path'))"` or equivalent).
4. Print a final summary, one row per (language, namespace):
   ```
   Language  | NS    | Added | Updated | Removed | Status
   ----------|-------|-------|---------|---------|-------
   de_DE     | core  |   3   |    1    |    0    |  OK
   de_DE     | peri  |   2   |    0    |    0    |  OK
   ja        | core  |   3   |    5    |    0    |  OK
   ja        | peri  |   0   |    0    |    0    |  OK
   ...
   ```

## Performance Strategy

- For a single language + single namespace: process directly in the main conversation.
- For all 33 languages and/or both namespaces: use the Agent tool to parallelize. Launch multiple agents, each handling a batch of ~4-5 languages (and both namespaces together so style stays consistent within a locale). Each agent receives:
  - The full English `core.json` and `peri.json`
  - The list of missing/untranslated keys per (language, namespace) (from Step 1)
  - The target language files to process (both namespaces)
  - These translation rules

## Edge Cases

| Case | Handling |
|---|---|
| Value same as English but intentional | Use the skip-list; also check if 5+ other languages have the same value |
| New language directory with empty/missing `core.json` or `peri.json` | Generate a complete translation from scratch for the missing file(s) |
| Locale has `core.json` but no `peri.json` | Create `peri.json` from scratch, translating every English peri key |
| Locale has `peri.json` but no `core.json` | Same in reverse — unusual but handle symmetrically |
| Key has only whitespace or empty string in target | Treat as untranslated |
| English value contains line breaks (`\n`) | Preserve line breaks in translation |
| English value is very long (100+ chars) | Translate fully, do not truncate |
| Key moved between `core` and `peri` namespaces | Detect by checking if an "orphan" in core appears in `en/peri.json` (or vice versa). Report as informational only; do not auto-migrate translations — the namespace split is a separate manual operation. |

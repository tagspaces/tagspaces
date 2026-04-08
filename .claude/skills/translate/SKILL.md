---
name: translate
description: Translate new or untranslated i18n strings from English core.json to all other locale files, maintaining consistency with each language's existing translations.
---

# Translate Skill

Automatically translate new or untranslated strings from the English `core.json` to all other locale files, maintaining consistency with each language's existing translations.

## Arguments

- No argument or `all`: process all languages
- A language code (e.g., `de_DE`, `ja`, `bg`): process only that language
- `report`: only show what's missing/untranslated, don't translate

## File Paths

- **Source of truth**: `src/renderer/locales/en/core.json`
- **Target locales**: every subdirectory of `src/renderer/locales/` except `en/`
- Each locale has a single file: `core.json` (flat key-value JSON, no nesting)

## Step 1 — Detect what needs translating

1. Read `src/renderer/locales/en/core.json` (the English source).
2. List all directories under `src/renderer/locales/` to discover target languages.
3. If a specific language was requested, only process that one; otherwise process all.
4. For each target locale, read its `core.json` and compare against English:
   - **Missing keys**: present in English but absent in the target file.
   - **Untranslated keys**: value in the target is identical to the English value AND the key is NOT in the skip-list (see below).
   - **Orphan keys**: present in the target but absent from English (candidates for removal).
5. Print a summary table to the user:
   ```
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

For each language that needs translations:

1. Read the full `core.json` for that language.
2. Select a **context sample** of ~50 existing translated key-value pairs. Prioritize:
   - Strings thematically similar to the ones being translated (e.g., if translating UI button labels, sample existing button labels).
   - A mix of short labels and longer descriptive strings to capture both terse and verbose style.
3. This sample will be used as a **style and terminology reference** when translating, ensuring:
   - Consistent tone and formality level (formal "Sie" vs informal "du" in German, etc.)
   - Consistent term choices (e.g., if "folder" has been translated as "Ordner" in German, keep using "Ordner")
   - Consistent punctuation patterns

## Step 3 — Translate

For each language, translate all missing and untranslated keys:

1. Use the English value as the source text.
2. Reference the context sample from Step 2 for style/terminology consistency.
3. Apply the following rules strictly:

### Translation Rules

- **NEVER modify `en/core.json`** — it is read-only for this skill.
- **Preserve `{{variables}}` exactly** — template placeholders like `{{fileName}}`, `{{version}}`, `{{count}}` must appear in the translation unchanged. Do not translate, reorder, or remove them.
- **Preserve HTML tags exactly** — tags like `<br>`, `<b>`, `</b>`, `<a>` etc. must remain intact.
- **Keep technical terms in English** across all languages: TagSpaces, Kanban, Markdown, HTML, S3, WebDAV, AI, URL, QR, EXIF, FolderViz, Mapique, JSON, PDF, EPUB, CSV, ZIP, GPX, KML, Pro.
- **German (de_DE) specific**: Use "Tags" for tags, NOT "Schlagwort/Schlagwörter". The English loanword "Tags" is the project standard.
- **Match existing tone**: If a language uses formal address (e.g., "Sie" in German, "Vous" in French), maintain that. If informal, maintain that. Determine this from the existing translations.
- **Natural phrasing**: Translations should read naturally in the target language, not be word-for-word calques from English.
- **Translate language by language** (not key by key) to maintain internal consistency within each locale.

## Step 4 — Write results

1. For each modified locale, construct the full `core.json` with:
   - **The same key order as `en/core.json`** (this keeps diffs clean and structure consistent).
   - All existing translations preserved (only missing/untranslated keys get new values).
   - Orphan keys removed (keys not present in `en/core.json`).
2. Write the file using the Write tool or Edit tool as appropriate.
3. **Validate JSON**: After writing, verify the file is valid JSON (use `node -e "JSON.parse(require('fs').readFileSync('path'))"` or equivalent).
4. Print a final summary:
   ```
   Language  | Added | Updated | Removed | Status
   ----------|-------|---------|---------|-------
   de_DE     |   3   |    1    |    0    |  OK
   ja        |   3   |    5    |    0    |  OK
   ...
   ```

## Performance Strategy

- For a single language: process directly in the main conversation.
- For all 33 languages: use the Agent tool to parallelize. Launch multiple agents, each handling a batch of ~4-5 languages. Each agent receives:
  - The full English `core.json`
  - The list of missing/untranslated keys (from Step 1)
  - The target language files to process
  - These translation rules

## Edge Cases

| Case | Handling |
|---|---|
| Value same as English but intentional | Use the skip-list; also check if 5+ other languages have the same value |
| New language directory with empty/missing `core.json` | Generate a complete translation from scratch |
| Key has only whitespace or empty string in target | Treat as untranslated |
| English value contains line breaks (`\n`) | Preserve line breaks in translation |
| English value is very long (100+ chars) | Translate fully, do not truncate |

/* Normalize .txt license files for cross-installer compatibility.
 *
 * Why: electron-builder's NSIS target auto-picks `assets/license*.{txt,rtf}`
 * from buildResources and feeds it to Windows RichEdit, which truncates
 * UTF-8-with-BOM files and prefers CRLF line endings. We rewrite the source
 * .txt files in place (BOM stripped, CRLF line endings, lines >120 chars
 * soft-wrapped) so the auto-detected NSIS license renders fully. macOS pkg
 * and the AppImage license viewer are happy with the same normalized .txt.
 * Runs from `prebuild`, so every packaging run produces clean output.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const sources = ['assets/license_en.txt', 'tagspacespro/EULA.txt'];

const MAX_LINE = 120;

function softWrap(line) {
  if (line.length <= MAX_LINE) return [line];
  const out = [];
  let rest = line;
  while (rest.length > MAX_LINE) {
    let cut = rest.lastIndexOf(' ', MAX_LINE);
    if (cut <= 0) cut = MAX_LINE;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut + (rest[cut] === ' ' ? 1 : 0));
  }
  if (rest.length) out.push(rest);
  return out;
}

function normalize(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return text.split('\n').flatMap(softWrap).join('\r\n');
}

let processed = 0;
for (const rel of sources) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.log(`[build-licenses] skipping (missing): ${rel}`);
    continue;
  }
  const raw = fs.readFileSync(abs, 'utf8');
  const normalized = normalize(raw);
  if (normalized !== raw) {
    fs.writeFileSync(abs, normalized, 'utf8');
    console.log(`[build-licenses] normalized: ${rel}`);
  } else {
    console.log(`[build-licenses] already clean: ${rel}`);
  }
  processed++;
}

if (processed === 0) console.log('[build-licenses] no sources processed');

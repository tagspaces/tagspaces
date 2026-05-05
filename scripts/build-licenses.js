/* Generate / normalize installer license files.
 *
 * Community: read `LICENSE.txt` (root, source of truth), strip BOM, convert to
 * CRLF, soft-wrap long lines, write the result to `resources/license_en.txt`.
 * This copy is what macOS pkg and Linux AppImage point at. It lives *outside*
 * electron-builder's buildResources (`assets/`) on purpose: any file matching
 * `license_*.{txt,rtf,html}` inside buildResources is auto-picked by the NSIS
 * target (plus gets a UTF-8 BOM re-injected), which we do not want.
 *
 * Pro: normalize `tagspacespro/EULA.txt` in place for pkg/AppImage. It already
 * lives outside its own buildResources dir, so no relocation needed.
 *
 * Runs from `prebuild`, so every packaging run produces clean output.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const jobs = [
  // Generated copy: reads LICENSE.txt, writes resources/license_en.txt
  { src: 'LICENSE.txt', dst: 'resources/license_en.txt' },
  // In-place normalization for the Pro EULA
  { src: 'tagspacespro/EULA.txt', dst: 'tagspacespro/EULA.txt' },
];

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
for (const { src, dst } of jobs) {
  const srcAbs = path.join(root, src);
  const dstAbs = path.join(root, dst);
  if (!fs.existsSync(srcAbs)) {
    console.log(`[build-licenses] skipping (missing): ${src}`);
    continue;
  }
  const raw = fs.readFileSync(srcAbs, 'utf8');
  const normalized = normalize(raw);

  if (srcAbs === dstAbs) {
    if (normalized !== raw) {
      fs.writeFileSync(dstAbs, normalized, 'utf8');
      console.log(`[build-licenses] normalized: ${src}`);
    } else {
      console.log(`[build-licenses] already clean: ${src}`);
    }
  } else {
    const existing = fs.existsSync(dstAbs)
      ? fs.readFileSync(dstAbs, 'utf8')
      : null;
    if (existing !== normalized) {
      fs.writeFileSync(dstAbs, normalized, 'utf8');
      console.log(`[build-licenses] ${src} -> ${dst}`);
    } else {
      console.log(`[build-licenses] already up-to-date: ${dst}`);
    }
  }
  processed++;
}

if (processed === 0) console.log('[build-licenses] no sources processed');

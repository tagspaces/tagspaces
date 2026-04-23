/* Regenerate .rtf license files from the .txt sources.
 *
 * Why: NSIS (Windows installer) truncates UTF-8-with-BOM .txt files and
 * can't handle very long lines. RTF sidesteps both. macOS pkg also
 * renders RTF natively. Runs as part of `prebuild` so every packaging
 * run picks up the latest source text.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const jobs = [
  { src: 'assets/license_en.txt', dst: 'assets/license_en.rtf' },
  { src: 'tagspacespro/EULA.txt', dst: 'tagspacespro/EULA.rtf' },
];

function escapeRtf(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = text.charCodeAt(i);
    if (ch === '\\') out += '\\\\';
    else if (ch === '{') out += '\\{';
    else if (ch === '}') out += '\\}';
    else if (ch === '\n') out += '\\par ';
    else if (ch === '\t') out += '\\tab ';
    else if (ch === '\r') continue;
    else if (code > 127) {
      const signed = code > 0x7fff ? code - 0x10000 : code;
      out += `\\u${signed}?`;
    } else out += ch;
  }
  return out;
}

function txtToRtf(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return (
    '{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033' +
    '{\\fonttbl{\\f0\\fnil\\fcharset0 Segoe UI;}}\n' +
    '\\viewkind4\\uc1\\pard\\f0\\fs20 ' +
    escapeRtf(text) +
    '\\par}\n'
  );
}

let generated = 0;
for (const job of jobs) {
  const src = path.join(root, job.src);
  const dst = path.join(root, job.dst);
  if (!fs.existsSync(src)) {
    console.log(`[build-licenses] skipping (missing source): ${job.src}`);
    continue;
  }
  fs.writeFileSync(dst, txtToRtf(fs.readFileSync(src, 'utf8')), 'utf8');
  console.log(`[build-licenses] ${job.src} -> ${job.dst}`);
  generated++;
}

if (generated === 0) console.log('[build-licenses] no licenses generated');

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

function escapeRtfLine(line) {
  let out = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const code = line.charCodeAt(i);
    if (ch === '\\') out += '\\\\';
    else if (ch === '{') out += '\\{';
    else if (ch === '}') out += '\\}';
    else if (ch === '\t') out += '\\tab ';
    else if (code > 127) {
      // NSIS ships older RichEdit; \'xx for Windows-1252 chars is safer than \uN?.
      // Everything outside Latin-1 becomes "?" — license files are almost always ASCII anyway.
      if (code <= 0xff) out += "\\'" + code.toString(16).padStart(2, '0');
      else out += '?';
    } else out += ch;
  }
  return out;
}

function txtToRtf(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n');
  const body = lines.map((l) => escapeRtfLine(l) + '\\par').join('\n');
  return (
    '{\\rtf1\\ansi\\ansicpg1252\\deff0\n' +
    '{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}\n' +
    '\\pard\\f0\\fs20\n' +
    body +
    '\n}\n'
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

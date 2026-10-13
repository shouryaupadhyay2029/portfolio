// Extracts the exact data (glyph path, shape keyframes, timing tables) and the
// embedded DM Sans fonts from blend-reference.html into React-usable files.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'blend-reference.html'), 'utf8');
const outDir = path.join(root, 'src', 'components', 'BlendPageTransition');

// 1. Data object D
const dStart = html.indexOf('const D =');
const dEnd = html.indexOf('};', dStart);
if (dStart < 0 || dEnd < 0) throw new Error('Could not find data object D');
const dObj = html.slice(html.indexOf('{', dStart), dEnd + 1);
JSON.parse(dObj); // validate
fs.writeFileSync(
  path.join(outDir, 'blendData.js'),
  '// Auto-generated from blend-reference.html by scripts/extract-blend.cjs\n' +
    'const BLEND_DATA = ' + dObj + ';\nexport default BLEND_DATA;\n'
);

// 2. @font-face rules
const fonts = html.match(/@font-face\s*{[\s\S]*?}/g) || [];
if (fonts.length < 2) throw new Error('Expected 2 @font-face rules, found ' + fonts.length);
fs.writeFileSync(
  path.join(outDir, 'blendFonts.css'),
  '/* Auto-generated from blend-reference.html */\n' + fonts.join('\n') + '\n'
);

console.log('OK: blendData.js + blendFonts.css (' + fonts.length + ' fonts)');

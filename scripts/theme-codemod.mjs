// One-off codemod: `StyleSheet.create({...})` -> `createStyles(() => ({...}))`
// so every stylesheet is rebuilt when the palette changes.
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'components'];
const NAME = 'StyleSheet.create(';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function matchParen(src, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const changed = [];

for (const file of ROOTS.flatMap((root) => walk(root))) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes(NAME)) continue;

  let index = src.lastIndexOf(NAME);
  while (index !== -1) {
    const open = index + NAME.length - 1;
    const close = matchParen(src, open);
    if (close === -1) break;
    src = `${src.slice(0, close)})${src.slice(close)}`;
    src = `${src.slice(0, open + 1)}() => (${src.slice(open + 1)}`;
    src = `${src.slice(0, index)}createStyles${src.slice(index + 'StyleSheet.create'.length)}`;
    index = src.lastIndexOf(NAME, index - 1);
  }

  if (!src.includes('StyleSheet.')) {
    src = src.replace(/\bStyleSheet,\s*/, '').replace(/,\s*StyleSheet\b(?!,)/, '');
  }

  if (!src.includes("from '@/utils/themedStyles'")) {
    let last = -1;
    const re = /^import\b/gm;
    let match;
    while ((match = re.exec(src)) !== null) {
      const end = src.indexOf("';", match.index);
      if (end !== -1) last = end + 2;
    }
    src = `${src.slice(0, last)}\nimport { createStyles } from '@/utils/themedStyles';${src.slice(last)}`;
  }

  fs.writeFileSync(file, src);
  changed.push(file);
}

console.log(`Rewrote ${changed.length} files:\n${changed.join('\n')}`);

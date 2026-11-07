import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', '.firebase']);
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else files.push(full);
  }
}
await walk(root);

let checked = 0;
const failures = [];
async function checkJavaScript(source, label, extension = '.mjs') {
  const temp = path.join(os.tmpdir(), `lokmart-${process.pid}-${checked}${extension}`);
  await writeFile(temp, source, 'utf8');
  const result = spawnSync(process.execPath, ['--check', temp], { encoding: 'utf8' });
  await unlink(temp).catch(() => {});
  checked++;
  if (result.status !== 0) failures.push(`${label}:\n${result.stderr || result.stdout}`);
}

for (const file of files) {
  const rel = path.relative(root, file);
  if (file.endsWith('.json')) {
    try { JSON.parse(await readFile(file, 'utf8')); }
    catch (error) { failures.push(`${rel}: invalid JSON — ${error.message}`); }
  }
  if (file.endsWith('.js')) {
    const source = await readFile(file, 'utf8');
    if (/^\s*<!doctype html|^\s*<html/i.test(source)) {
      console.log(`SKIP legacy HTML stored with .js extension: ${rel}`);
    } else {
      await checkJavaScript(source, rel);
    }
  }
  if (file.endsWith('.html')) {
    const html = await readFile(file, 'utf8');
    const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
    let match;
    let index = 0;
    while ((match = scriptPattern.exec(html))) {
      const attrs = match[1] || '';
      const type = (attrs.match(/\btype\s*=\s*["']?([^\s"'>]+)/i) || [])[1] || '';
      if (type.toLowerCase() === 'application/ld+json' || type.toLowerCase() === 'application/json') continue;
      if (!match[2].trim()) continue;
      await checkJavaScript(match[2], `${rel} inline script #${++index}`, type.toLowerCase() === 'module' ? '.mjs' : '.cjs');
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n\n'));
  process.exit(1);
}
console.log(`Syntax validation passed: ${checked} JavaScript files / inline scripts checked; JSON files parsed.`);

// Builds dist/: just the files a static host should serve, plus `_headers` and `_redirects` generated from vercel.json,
// so Cloudflare Pages (and Netlify, which reads the same two files) send the same security headers and redirects as Vercel.
// Vercel itself needs no build: it serves the repo root as-is.
//
//   node tools/build-dist.mjs        -> writes dist/ and checks that every local link in the pages points at a file that exists
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
const cfg = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Pages, and the screenshots the hub shows.
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
pages.forEach((f) => copyFileSync(join(ROOT, f), join(OUT, f)));
const shots = join(ROOT, 'docs', 'screenshots');
mkdirSync(join(OUT, 'docs', 'screenshots'), { recursive: true });
readdirSync(shots).filter((f) => /\.(png|jpg|svg|webp)$/i.test(f)).forEach((f) => copyFileSync(join(shots, f), join(OUT, 'docs', 'screenshots', f)));

// _headers: "/(.*)" in vercel.json means every path, which is "/*" here.
const toPath = (src) => (src === '/(.*)' ? '/*' : src);
const headerBlocks = (cfg.headers || []).map((h) => toPath(h.source) + '\n' + h.headers.map((x) => '  ' + x.key + ': ' + x.value).join('\n'));
writeFileSync(join(OUT, '_headers'), headerBlocks.join('\n\n') + '\n');

// _redirects: expand "(.html)?" into two lines. Vercel's permanent flag becomes 301, otherwise 302.
const redirectLines = [];
(cfg.redirects || []).forEach((r) => {
  const status = r.permanent ? 301 : 302;
  const sources = r.source.includes('(.html)?') ? [r.source.replace('(.html)?', ''), r.source.replace('(.html)?', '.html')] : [r.source];
  sources.forEach((s) => redirectLines.push(s + ' ' + r.destination + ' ' + status));
});
writeFileSync(join(OUT, '_redirects'), redirectLines.join('\n') + '\n');

// Every local href/src in the pages must exist in dist (external links, data: URIs, #anchors and mailto are skipped).
const missing = [];
pages.forEach((f) => {
  const html = readFileSync(join(OUT, f), 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|data:|#|mailto:|javascript:)/.test(u)) continue;
    const file = u.split('#')[0].split('?')[0];
    if (file && !existsSync(join(OUT, file))) missing.push(f + ' -> ' + u);
  }
});
console.log('dist/: ' + pages.length + ' pages, ' + readdirSync(join(OUT, 'docs', 'screenshots')).length + ' screenshots, _headers (' + headerBlocks.length + ' rule), _redirects (' + redirectLines.length + ' lines)');
if (missing.length) { console.error('Broken local links:\n  ' + missing.join('\n  ')); process.exit(1); }
console.log('All local links resolve.');
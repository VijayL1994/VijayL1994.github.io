#!/usr/bin/env node
/**
 * 重建图片清单 —— 零依赖
 *
 *   node tools/build-manifest.mjs
 *
 * 做什么：
 *   扫描 images/ 目录下所有 .jpg/.jpeg/.png/.webp，
 *   直接读文件头解析出宽高，生成 images/_manifest.json。
 *
 * 想换图？把新照片丢进 images/ 里，跑一次这个脚本就行。
 *
 * 作品标题规则：取文件名里第一个 "-" 之后的部分。
 *   012-xvessel.jpg        -> "XVESSEL"
 *   020-pizza-hut.jpg      -> "Pizza Hut"
 *   my-new-shoot.jpg       -> "New Shoot"
 * 想自定义标题，直接改生成后的 _manifest.json 里的 title 字段即可。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMGDIR = path.join(ROOT, 'images');
const OUT    = path.join(IMGDIR, '_manifest.json');

/* ---------- 读文件头拿宽高（不依赖任何库） ---------- */
function sizeOf(buf) {
  // PNG
  if (buf.readUInt32BE(0) === 0x89504e47)
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };

  // GIF
  if (buf.slice(0, 3).toString('latin1') === 'GIF')
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };

  // WebP
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') {
    const fmt = buf.slice(12, 16).toString('latin1');
    if (fmt === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (fmt === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
    if (fmt === 'VP8X') return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
  }

  // JPEG — 遍历 marker 段找 SOFn
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      // SOF0..SOF15，跳过 DHT(c4)/JPG(c8)/DAC(cc)
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

const SMALL = new Set(['and', 'or', 'of', 'the', 'by', 'in', 'on', 'a']);
function titleFrom(file) {
  let base = path.parse(file).name;
  base = base.replace(/^\d+[-_]/, '');                 // 去掉前面的序号
  const words = base.split(/[-_\s]+/).filter(Boolean);
  if (!words.length) return 'Untitled';
  return words
    .map((w, i) => {
      if (/^[a-z]+$/.test(w) && w.length <= 3 && !SMALL.has(w)) return w.toUpperCase(); // 缩写：bmw -> BMW
      if (SMALL.has(w) && i > 0) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/* ---------- 主流程 ---------- */
if (!fs.existsSync(IMGDIR)) {
  console.error('✗ 找不到 images/ 目录：' + IMGDIR);
  process.exit(1);
}

// 保留已有的自定义标题
let prev = {};
if (fs.existsSync(OUT)) {
  try {
    for (const it of JSON.parse(fs.readFileSync(OUT, 'utf8'))) prev[it.file] = it.title;
  } catch { /* 忽略损坏的旧文件 */ }
}

const files = fs.readdirSync(IMGDIR)
  .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f) && !f.startsWith('.'))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const out = [];
const skipped = [];
for (const f of files) {
  const fd = fs.openSync(path.join(IMGDIR, f), 'r');
  const buf = Buffer.alloc(65536);
  const n = fs.readSync(fd, buf, 0, 65536, 0);
  fs.closeSync(fd);
  const dim = sizeOf(buf.slice(0, n));
  if (!dim || !dim.w || !dim.h) { skipped.push(f); continue; }
  out.push({ file: f, title: prev[f] || titleFrom(f), w: dim.w, h: dim.h });
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`✓ 已写入 ${path.relative(ROOT, OUT)} —— 共 ${out.length} 张`);
if (Object.keys(prev).length) console.log('  （已保留你之前自定义的标题）');
if (skipped.length) console.log('⚠ 无法解析尺寸，已跳过：' + skipped.join(', '));

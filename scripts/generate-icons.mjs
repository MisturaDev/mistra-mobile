import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'assets', 'images');

const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#F5F3FF',
  primaryMuted: '#DDD6FE',
  white: '#FFFFFF',
};

// Matches Logo.tsx lg proportions: outer 108, middle 72, inner 38
const RATIO = { outer: 108, middle: 72, inner: 38 };

function buildLogoSvg(size, { background, monochrome = false } = {}) {
  const outer = Math.round(size * 0.55);
  const middle = Math.round(outer * (RATIO.middle / RATIO.outer));
  const inner = Math.round(outer * (RATIO.inner / RATIO.outer));
  const cx = size / 2;
  const cy = size / 2;

  const bg =
    background === 'white'
      ? `<rect width="${size}" height="${size}" fill="${COLORS.white}"/>`
      : background === 'purple'
        ? `<rect width="${size}" height="${size}" fill="${COLORS.primaryLight}"/>`
        : '';

  if (monochrome) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <circle cx="${cx}" cy="${cy}" r="${outer / 2}" fill="#FFFFFF"/>
  <circle cx="${cx}" cy="${cy}" r="${middle / 2}" fill="#FFFFFF" opacity="0.75"/>
  <circle cx="${cx}" cy="${cy}" r="${inner / 2}" fill="#FFFFFF"/>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <circle cx="${cx}" cy="${cy}" r="${outer / 2}" fill="${COLORS.primaryLight}"/>
  <circle cx="${cx}" cy="${cy}" r="${middle / 2}" fill="${COLORS.primaryMuted}"/>
  <circle cx="${cx}" cy="${cy}" r="${inner / 2}" fill="${COLORS.primary}"/>
</svg>`;
}

async function writePng(filename, svg) {
  const path = join(outDir, filename);
  await sharp(Buffer.from(svg)).png().toFile(path);
  console.log(`Wrote ${filename}`);
}

async function writeSolidPng(filename, color, size = 1024) {
  const path = join(outDir, filename);
  await sharp({
    create: { width: size, height: size, channels: 4, background: color },
  })
    .png()
    .toFile(path);
  console.log(`Wrote ${filename}`);
}

mkdirSync(outDir, { recursive: true });

await writePng('icon.png', buildLogoSvg(1024, { background: 'white' }));
await writePng(
  'android-icon-foreground.png',
  buildLogoSvg(1024, { background: 'transparent' }),
);
await writeSolidPng('android-icon-background.png', COLORS.primaryLight);
await writePng(
  'android-icon-monochrome.png',
  buildLogoSvg(1024, { background: 'transparent', monochrome: true }),
);
await writePng('favicon.png', buildLogoSvg(192, { background: 'white' }));

console.log('Done — Mistra icons generated.');

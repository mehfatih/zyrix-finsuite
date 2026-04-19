// ================================================================
// PWA Icons Generator
// شغّله مرة واحدة لتوليد كل الـ icons
// npm install sharp  ثم  node generate-icons.js
// ================================================================
const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// SVG source
const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6C3AFF"/>
      <stop offset="100%" style="stop-color:#F43F8E"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#g)"/>
  <text x="50" y="72" font-family="Arial Black, sans-serif" font-size="58" font-weight="900"
        text-anchor="middle" fill="white">Z</text>
</svg>
`);

async function generate() {
  for (const size of sizes) {
    const outPath = path.join(outDir, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✅ icon-${size}.png`);
  }
  console.log(`\n🎉 ${sizes.length} icon oluşturuldu → public/icons/`);
}

generate().catch(console.error);
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "..", "assets");

async function convertSVGToPNG(svgPath, pngPath, size) {
  try {
    await sharp(svgPath).resize(size, size).png().toFile(pngPath);
    console.log(
      `✅ Converted ${path.basename(svgPath)} to ${path.basename(
        pngPath
      )} (${size}x${size})`
    );
  } catch (error) {
    console.error(`❌ Error converting ${svgPath}:`, error.message);
  }
}

async function generatePNGAssets() {
  console.log("🔄 Converting SVG assets to PNG...\n");

  const conversions = [
    { svg: "icon.svg", png: "icon.png", size: 1024 },
    { svg: "splash.svg", png: "splash-icon.png", size: 1024 },
    { svg: "adaptive-icon.svg", png: "adaptive-icon.png", size: 1024 },
    { svg: "favicon.svg", png: "favicon.png", size: 32 },
  ];

  for (const conversion of conversions) {
    const svgPath = path.join(assetsDir, conversion.svg);
    const pngPath = path.join(assetsDir, conversion.png);

    if (fs.existsSync(svgPath)) {
      await convertSVGToPNG(svgPath, pngPath, conversion.size);
    } else {
      console.log(`⚠️  SVG file not found: ${conversion.svg}`);
    }
  }

  console.log("\n✅ PNG conversion completed!");
  console.log("📁 Generated files:");
  console.log("  - assets/icon.png (1024x1024)");
  console.log("  - assets/splash-icon.png (1024x1024)");
  console.log("  - assets/adaptive-icon.png (1024x1024)");
  console.log("  - assets/favicon.png (32x32)");
}

generatePNGAssets().catch(console.error);

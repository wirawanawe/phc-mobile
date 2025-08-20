const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// SVG template for PHC app icon with full text
const generateAppIconSVG = (size = 512) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="256" fill="#D32F2F"/>
  
  <!-- Heart and Ribbon Elements - Centered and scaled -->
  <path d="M120 160 Q120 120 176 120 Q240 120 240 160 Q240 120 304 120 Q360 120 360 160 Q360 200 240 240 Q120 200 120 160" fill="#FFFFFF"/>
  
  <!-- Central Circle -->
  <circle cx="240" cy="200" r="48" fill="#FFFFFF"/>
  
  <!-- Ribbon Elements - Flowing from center -->
  <path d="M192 200 Q144 240 120 280 Q144 320 192 360 Q216 320 240 280 Q216 240 192 200" fill="#FFFFFF"/>
  <path d="M288 200 Q336 240 360 280 Q336 320 288 360 Q264 320 240 280 Q264 240 288 200" fill="#FFFFFF"/>
  <path d="M240 152 Q200 120 160 144 Q200 168 240 200 Q280 168 320 144 Q280 120 240 152" fill="#FFFFFF"/>
  
  <!-- Stethoscope - Integrated with text -->
  <path d="M240 152 Q280 136 320 152 Q360 176 360 200 Q360 224 320 240 Q280 256 240 240 Q200 256 160 240 Q120 224 120 200 Q120 176 160 152 Q200 136 240 152" fill="none" stroke="#FFFFFF" stroke-width="16"/>
  
  <!-- Stethoscope Earpieces -->
  <circle cx="360" cy="200" r="24" fill="#FFFFFF"/>
  <circle cx="120" cy="200" r="24" fill="#FFFFFF"/>
  
  <!-- Stethoscope Bell/Diaphragm -->
  <circle cx="384" cy="224" r="12" fill="#FFFFFF"/>
  <circle cx="96" cy="224" r="12" fill="#FFFFFF"/>
  
  <!-- Additional ribbon details -->
  <path d="M240 120 Q224 96 200 120 Q224 144 240 160 Q256 144 280 120 Q256 96 240 120" fill="#FFFFFF"/>
  
  <!-- PHC Text -->
  <path d="M320 160 L320 224 M320 160 L400 160 L400 192 L320 192 L320 224 L400 224" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M320 240 L400 240 M360 240 L360 288" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M320 264 L400 264 M320 264 L400 288 M400 264 L320 288" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Indonesia Text -->
  <text x="320" y="320" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#FFFFFF">INDONESIA</text>
</svg>`;
};

// Generate app icon with full logo
const generateAppIcon = async () => {
  console.log("🔄 Generating PHC App Icon...\n");

  const assetsDir = path.join(__dirname, "..", "assets");

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  try {
    // Generate SVG with full logo
    const iconSVG = generateAppIconSVG(512);
    const svgPath = path.join(assetsDir, "icon-full.svg");
    fs.writeFileSync(svgPath, iconSVG);

    // Convert to PNG for app icon
    const pngPath = path.join(assetsDir, "icon.png");
    await sharp(Buffer.from(iconSVG))
      .resize(512, 512)
      .png()
      .toFile(pngPath);

    // Also generate adaptive icon
    const adaptiveIconPath = path.join(assetsDir, "adaptive-icon.png");
    await sharp(Buffer.from(iconSVG))
      .resize(512, 512)
      .png()
      .toFile(adaptiveIconPath);

    console.log("✅ PHC App Icon generated successfully!");
    console.log("📁 Files created:");
    console.log("  - assets/icon-full.svg (512x512)");
    console.log("  - assets/icon.png (512x512)");
    console.log("  - assets/adaptive-icon.png (512x512)");
    console.log("");
    console.log("💡 The icon now includes the full 'PHC Indonesia' text!");
  } catch (error) {
    console.error("❌ Error generating app icon:", error.message);
  }
};

generateAppIcon().catch(console.error);

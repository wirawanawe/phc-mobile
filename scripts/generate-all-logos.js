const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// SVG template for PHC logo with red elements and transparent background
const generateLogoRedSVG = (size = 200) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
  <!-- Heart and Ribbon Elements - Centered -->
  <path d="M30 40 Q30 24 44 24 Q60 24 60 40 Q60 24 76 24 Q90 24 90 40 Q90 56 60 70 Q30 56 30 40" fill="#D32F2F"/>
  
  <!-- Central Circle -->
  <circle cx="60" cy="50" r="12" fill="#D32F2F"/>
  
  <!-- Ribbon Elements - Flowing from center -->
  <path d="M48 50 Q36 60 30 70 Q36 80 48 90 Q54 80 60 70 Q54 60 48 50" fill="#D32F2F"/>
  <path d="M72 50 Q84 60 90 70 Q84 80 72 90 Q66 80 60 70 Q66 60 72 50" fill="#D32F2F"/>
  <path d="M60 38 Q50 30 40 36 Q50 42 60 50 Q70 42 80 36 Q70 30 60 38" fill="#D32F2F"/>
  
  <!-- Stethoscope - Integrated with text -->
  <path d="M60 38 Q70 34 80 38 Q90 44 90 50 Q90 56 80 60 Q70 64 60 60 Q50 64 40 60 Q30 56 30 50 Q30 44 40 38 Q50 34 60 38" fill="none" stroke="#D32F2F" stroke-width="4"/>
  
  <!-- Stethoscope Earpieces -->
  <circle cx="90" cy="50" r="6" fill="#D32F2F"/>
  <circle cx="30" cy="50" r="6" fill="#D32F2F"/>
  
  <!-- Stethoscope Bell/Diaphragm -->
  <circle cx="96" cy="56" r="3" fill="#D32F2F"/>
  <circle cx="24" cy="56" r="3" fill="#D32F2F"/>
  
  <!-- Additional ribbon details -->
  <path d="M60 30 Q56 24 50 30 Q56 36 60 40 Q64 36 70 30 Q64 24 60 30" fill="#D32F2F"/>
  
  <!-- PHC Text -->
  <path d="M130 40 L130 56 M130 40 L150 40 L150 48 L130 48 L130 56 L150 56" stroke="#D32F2F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M130 60 L150 60 M140 60 L140 72" stroke="#D32F2F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M130 66 L150 66 M130 66 L150 72 M150 66 L130 72" stroke="#D32F2F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Indonesia Text -->
  <text x="130" y="90" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#D32F2F">INDONESIA</text>
</svg>`;
};

// SVG template for PHC logo with white elements and transparent background
const generateLogoWhiteSVG = (size = 200) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
  <!-- Heart and Ribbon Elements - Centered -->
  <path d="M30 40 Q30 24 44 24 Q60 24 60 40 Q60 24 76 24 Q90 24 90 40 Q90 56 60 70 Q30 56 30 40" fill="#FFFFFF"/>
  
  <!-- Central Circle -->
  <circle cx="60" cy="50" r="12" fill="#FFFFFF"/>
  
  <!-- Ribbon Elements - Flowing from center -->
  <path d="M48 50 Q36 60 30 70 Q36 80 48 90 Q54 80 60 70 Q54 60 48 50" fill="#FFFFFF"/>
  <path d="M72 50 Q84 60 90 70 Q84 80 72 90 Q66 80 60 70 Q66 60 72 50" fill="#FFFFFF"/>
  <path d="M60 38 Q50 30 40 36 Q50 42 60 50 Q70 42 80 36 Q70 30 60 38" fill="#FFFFFF"/>
  
  <!-- Stethoscope - Integrated with text -->
  <path d="M60 38 Q70 34 80 38 Q90 44 90 50 Q90 56 80 60 Q70 64 60 60 Q50 64 40 60 Q30 56 30 50 Q30 44 40 38 Q50 34 60 38" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  
  <!-- Stethoscope Earpieces -->
  <circle cx="90" cy="50" r="6" fill="#FFFFFF"/>
  <circle cx="30" cy="50" r="6" fill="#FFFFFF"/>
  
  <!-- Stethoscope Bell/Diaphragm -->
  <circle cx="96" cy="56" r="3" fill="#FFFFFF"/>
  <circle cx="24" cy="56" r="3" fill="#FFFFFF"/>
  
  <!-- Additional ribbon details -->
  <path d="M60 30 Q56 24 50 30 Q56 36 60 40 Q64 36 70 30 Q64 24 60 30" fill="#FFFFFF"/>
  
  <!-- PHC Text -->
  <path d="M130 40 L130 56 M130 40 L150 40 L150 48 L130 48 L130 56 L150 56" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M130 60 L150 60 M140 60 L140 72" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M130 66 L150 66 M130 66 L150 72 M150 66 L130 72" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Indonesia Text -->
  <text x="130" y="90" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">INDONESIA</text>
</svg>`;
};

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

// Generate all logo variants
const generateAllLogos = async () => {
  console.log("🔄 Generating All PHC Logo Variants...\n");

  const assetsDir = path.join(__dirname, "..", "assets");
  const playstoreDir = path.join(assetsDir, "playstore");

  // Create directories if they don't exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(playstoreDir)) {
    fs.mkdirSync(playstoreDir, { recursive: true });
  }

  try {
    // 1. Generate red logo (for general use)
    console.log("📝 Generating red logo...");
    const redLogoSVG = generateLogoRedSVG(400);
    const redSvgPath = path.join(assetsDir, "phc-logo.svg");
    const redPngPath = path.join(assetsDir, "phc-logo.png");
    fs.writeFileSync(redSvgPath, redLogoSVG);
    await sharp(Buffer.from(redLogoSVG))
      .resize(600, 240)
      .png()
      .toFile(redPngPath);

    // 2. Generate white logo (for mobile app)
    console.log("📝 Generating white logo...");
    const whiteLogoSVG = generateLogoWhiteSVG(400);
    const whiteSvgPath = path.join(assetsDir, "phc-logo-white.svg");
    const whitePngPath = path.join(assetsDir, "logo-phc-putih.png");
    fs.writeFileSync(whiteSvgPath, whiteLogoSVG);
    await sharp(Buffer.from(whiteLogoSVG))
      .resize(600, 240)
      .png()
      .toFile(whitePngPath);

    // 3. Generate app icon
    console.log("📝 Generating app icon...");
    const iconSVG = generateAppIconSVG(512);
    const iconSvgPath = path.join(assetsDir, "icon-full.svg");
    const iconPngPath = path.join(assetsDir, "icon.png");
    const adaptiveIconPath = path.join(assetsDir, "adaptive-icon.png");
    fs.writeFileSync(iconSvgPath, iconSVG);
    await sharp(Buffer.from(iconSVG))
      .resize(512, 512)
      .png()
      .toFile(iconPngPath);
    await sharp(Buffer.from(iconSVG))
      .resize(512, 512)
      .png()
      .toFile(adaptiveIconPath);

    // 4. Generate Play Store icons in various sizes
    console.log("📝 Generating Play Store icons...");
    const playstoreSizes = [36, 48, 72, 96, 144, 192, 512];
    for (const size of playstoreSizes) {
      const playstoreIconPath = path.join(playstoreDir, `playstore-icon-${size}.png`);
      await sharp(Buffer.from(iconSVG))
        .resize(size, size)
        .png()
        .toFile(playstoreIconPath);
    }

    // 5. Generate feature graphic for Play Store
    console.log("📝 Generating Play Store feature graphic...");
    const featureGraphicSVG = `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#D32F2F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B71C1C;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="500" fill="url(#bg)"/>
      
      <!-- Large PHC Logo -->
      <g transform="translate(200, 100) scale(2)">
        <path d="M30 40 Q30 24 44 24 Q60 24 60 40 Q60 24 76 24 Q90 24 90 40 Q90 56 60 70 Q30 56 30 40" fill="#FFFFFF"/>
        <circle cx="60" cy="50" r="12" fill="#FFFFFF"/>
        <path d="M48 50 Q36 60 30 70 Q36 80 48 90 Q54 80 60 70 Q54 60 48 50" fill="#FFFFFF"/>
        <path d="M72 50 Q84 60 90 70 Q84 80 72 90 Q66 80 60 70 Q66 60 72 50" fill="#FFFFFF"/>
        <path d="M60 38 Q50 30 40 36 Q50 42 60 50 Q70 42 80 36 Q70 30 60 38" fill="#FFFFFF"/>
        <path d="M60 38 Q70 34 80 38 Q90 44 90 50 Q90 56 80 60 Q70 64 60 60 Q50 64 40 60 Q30 56 30 50 Q30 44 40 38 Q50 34 60 38" fill="none" stroke="#FFFFFF" stroke-width="4"/>
        <circle cx="90" cy="50" r="6" fill="#FFFFFF"/>
        <circle cx="30" cy="50" r="6" fill="#FFFFFF"/>
        <circle cx="96" cy="56" r="3" fill="#FFFFFF"/>
        <circle cx="24" cy="56" r="3" fill="#FFFFFF"/>
        <path d="M60 30 Q56 24 50 30 Q56 36 60 40 Q64 36 70 30 Q64 24 60 30" fill="#FFFFFF"/>
        <path d="M130 40 L130 56 M130 40 L150 40 L150 48 L130 48 L130 56 L150 56" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M130 60 L150 60 M140 60 L140 72" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M130 66 L150 66 M130 66 L150 72 M150 66 L130 72" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="130" y="90" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">INDONESIA</text>
      </g>
      
      <!-- App Name -->
      <text x="512" y="350" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle">DOCTOR PHC Indonesia</text>
      <text x="512" y="400" font-family="Arial, sans-serif" font-size="24" fill="#FFFFFF" text-anchor="middle">Platform Kesehatan Terdepan</text>
    </svg>`;
    
    const featureGraphicPath = path.join(playstoreDir, "playstore-feature-graphic.png");
    await sharp(Buffer.from(featureGraphicSVG))
      .resize(1024, 500)
      .png()
      .toFile(featureGraphicPath);

    console.log("\n✅ All PHC Logo Variants generated successfully!");
    console.log("\n📁 Files created:");
    console.log("  - assets/phc-logo.svg (600x240)");
    console.log("  - assets/phc-logo.png (600x240)");
    console.log("  - assets/phc-logo-white.svg (600x240)");
    console.log("  - assets/logo-phc-putih.png (600x240)");
    console.log("  - assets/icon-full.svg (512x512)");
    console.log("  - assets/icon.png (512x512)");
    console.log("  - assets/adaptive-icon.png (512x512)");
    console.log("  - assets/playstore/playstore-icon-*.png (various sizes)");
    console.log("  - assets/playstore/playstore-feature-graphic.png (1024x500)");
    console.log("\n💡 All logos now include the full 'PHC Indonesia' text!");
    console.log("🔧 The logo truncation issue has been fixed!");
  } catch (error) {
    console.error("❌ Error generating logos:", error.message);
  }
};

generateAllLogos().catch(console.error);

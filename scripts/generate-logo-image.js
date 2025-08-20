const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// SVG template for PHC logo with transparent background
const generateLogoImageSVG = (size = 200) => {
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

// Generate logo image with transparent background
const generateLogoImage = async () => {
  console.log("🔄 Generating PHC Logo Image...\n");

  const assetsDir = path.join(__dirname, "..", "assets");

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  try {
    // Generate SVG with transparent background
    const logoSVG = generateLogoImageSVG(400);
    const svgPath = path.join(assetsDir, "phc-logo.svg");
    fs.writeFileSync(svgPath, logoSVG);

    // Convert to PNG with transparent background
    const pngPath = path.join(assetsDir, "phc-logo.png");
    await sharp(Buffer.from(logoSVG))
      .resize(600, 240) // 5:2.5 aspect ratio to accommodate full text
      .png()
      .toFile(pngPath);

    console.log("✅ PHC Logo Image generated successfully!");
    console.log("📁 Files created:");
    console.log("  - assets/phc-logo.svg (600x240)");
    console.log("  - assets/phc-logo.png (600x240)");
    console.log("");
    console.log("💡 You can now use this image in your Logo component:");
    console.log('   source={require("../assets/phc-logo.png")}');
  } catch (error) {
    console.error("❌ Error generating logo image:", error.message);
  }
};

generateLogoImage().catch(console.error);

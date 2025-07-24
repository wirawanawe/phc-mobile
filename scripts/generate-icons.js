const fs = require("fs");
const path = require("path");

// SVG template for PHC logo
const generatePHCLogoSVG = (size = 100) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="100" height="100" fill="#D32F2F"/>
  
  <!-- Heart and Ribbon Elements - Centered -->
  <path d="M25 35 Q25 25 32 25 Q40 25 40 35 Q40 25 48 25 Q55 25 55 35 Q55 45 40 52 Q25 45 25 35" fill="#FFFFFF"/>
  
  <!-- Central Circle -->
  <circle cx="40" cy="40" r="8" fill="#FFFFFF"/>
  
  <!-- Ribbon Elements - Flowing from center -->
  <path d="M32 40 Q26 45 25 50 Q26 55 32 60 Q35 55 40 50 Q35 45 32 40" fill="#FFFFFF"/>
  <path d="M48 40 Q54 45 55 50 Q54 55 48 60 Q45 55 40 50 Q45 45 48 40" fill="#FFFFFF"/>
  <path d="M40 34 Q35 30 30 33 Q35 36 40 40 Q45 36 50 33 Q45 30 40 34" fill="#FFFFFF"/>
  
  <!-- Stethoscope - Integrated with text -->
  <path d="M40 34 Q45 32 50 34 Q55 37 55 40 Q55 43 50 45 Q45 47 40 45 Q35 47 30 45 Q25 43 25 40 Q25 37 30 34 Q35 32 40 34" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  
  <!-- Stethoscope Earpieces -->
  <circle cx="55" cy="40" r="3" fill="#FFFFFF"/>
  <circle cx="25" cy="40" r="3" fill="#FFFFFF"/>
  
  <!-- Stethoscope Bell/Diaphragm -->
  <circle cx="58" cy="43" r="2" fill="#FFFFFF"/>
  <circle cx="22" cy="43" r="2" fill="#FFFFFF"/>
  
  <!-- Additional ribbon details -->
  <path d="M40 30 Q38 27 35 30 Q38 33 40 35 Q42 33 45 30 Q42 27 40 30" fill="#FFFFFF"/>
  
  <!-- PHC Text -->
  <path d="M65 35 L65 45 M65 35 L75 35 L75 40 L65 40 L65 45 L75 45" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M65 50 L75 50 M70 50 L70 60" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M65 55 L75 55 M65 55 L75 60 M75 55 L65 60" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

// Generate splash screen SVG
const generateSplashSVG = () => {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="1024" height="1024" fill="#D32F2F"/>
  
  <!-- Heart and Ribbon Elements - Centered and Larger -->
  <path d="M256 358 Q256 256 328 256 Q410 256 410 358 Q410 256 492 256 Q564 256 564 358 Q564 460 410 532 Q256 460 256 358" fill="#FFFFFF"/>
  
  <!-- Central Circle -->
  <circle cx="410" cy="410" r="82" fill="#FFFFFF"/>
  
  <!-- Ribbon Elements - Flowing from center -->
  <path d="M328 410 Q266 460 256 512 Q266 564 328 614 Q358 564 410 512 Q358 460 328 410" fill="#FFFFFF"/>
  <path d="M492 410 Q554 460 564 512 Q554 564 492 614 Q462 564 410 512 Q462 460 492 410" fill="#FFFFFF"/>
  <path d="M410 348 Q358 307 307 338 Q358 369 410 410 Q462 369 512 338 Q462 307 410 348" fill="#FFFFFF"/>
  
  <!-- Stethoscope - Integrated with text -->
  <path d="M410 348 Q461 328 512 348 Q564 378 564 410 Q564 440 512 460 Q461 481 410 460 Q358 481 307 460 Q256 440 256 410 Q256 378 307 348 Q358 328 410 348" fill="none" stroke="#FFFFFF" stroke-width="20"/>
  
  <!-- Stethoscope Earpieces -->
  <circle cx="564" cy="410" r="31" fill="#FFFFFF"/>
  <circle cx="256" cy="410" r="31" fill="#FFFFFF"/>
  
  <!-- Stethoscope Bell/Diaphragm -->
  <circle cx="594" cy="440" r="20" fill="#FFFFFF"/>
  <circle cx="226" cy="440" r="20" fill="#FFFFFF"/>
  
  <!-- Additional ribbon details -->
  <path d="M410 307 Q389 276 358 307 Q389 338 410 358 Q431 338 461 307 Q431 276 410 307" fill="#FFFFFF"/>
  
  <!-- PHC Text - Larger -->
  <path d="M665 358 L665 460 M665 358 L768 358 L768 410 L665 410 L665 460 L768 460" stroke="#FFFFFF" stroke-width="31" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M665 512 L768 512 M717 512 L717 614" stroke="#FFFFFF" stroke-width="31" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M665 563 L768 563 M665 563 L768 614 M768 563 L665 614" stroke="#FFFFFF" stroke-width="31" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, "..", "assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate icon.svg
const iconSVG = generatePHCLogoSVG(1024);
fs.writeFileSync(path.join(assetsDir, "icon.svg"), iconSVG);

// Generate splash.svg
const splashSVG = generateSplashSVG();
fs.writeFileSync(path.join(assetsDir, "splash.svg"), splashSVG);

// Generate adaptive icon (foreground only)
const adaptiveIconSVG = generatePHCLogoSVG(1024).replace(
  '<rect x="0" y="0" width="100" height="100" fill="#D32F2F"/>',
  ""
);
fs.writeFileSync(path.join(assetsDir, "adaptive-icon.svg"), adaptiveIconSVG);

// Generate favicon
const faviconSVG = generatePHCLogoSVG(32);
fs.writeFileSync(path.join(assetsDir, "favicon.svg"), faviconSVG);

console.log("✅ PHC Logo assets generated successfully!");
console.log("📁 Files created:");
console.log("  - assets/icon.svg (1024x1024)");
console.log("  - assets/splash.svg (1024x1024)");
console.log("  - assets/adaptive-icon.svg (1024x1024)");
console.log("  - assets/favicon.svg (32x32)");
console.log("");
console.log(
  "💡 To convert to PNG, you can use online tools or image editing software."
);
console.log("   Recommended sizes:");
console.log("   - icon.png: 1024x1024");
console.log("   - splash-icon.png: 1024x1024");
console.log("   - adaptive-icon.png: 1024x1024");
console.log("   - favicon.png: 32x32");

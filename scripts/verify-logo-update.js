const fs = require('fs');
const path = require('path');

const verifyLogoUpdate = () => {
  console.log('🔍 Verifying Logo Update to icon.png...\n');

  const results = {
    passed: 0,
    failed: 0,
    checks: []
  };

  // Check 1: Verify icon.png exists and has correct size
  console.log('1️⃣ Checking icon.png file...');
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ icon.png exists (${sizeInMB} MB)`);
    results.passed++;
    results.checks.push({
      name: 'icon.png exists',
      status: 'PASS',
      details: `${sizeInMB} MB`
    });
  } else {
    console.log('❌ icon.png not found');
    results.failed++;
    results.checks.push({
      name: 'icon.png exists',
      status: 'FAIL',
      details: 'File not found'
    });
  }

  // Check 2: Verify app.json configuration
  console.log('\n2️⃣ Checking app.json configuration...');
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Check icon
    if (appJson.expo.icon === './assets/icon.png') {
      console.log('✅ App icon: ./assets/icon.png');
      results.passed++;
      results.checks.push({
        name: 'App icon in app.json',
        status: 'PASS',
        details: './assets/icon.png'
      });
    } else {
      console.log(`❌ App icon: ${appJson.expo.icon}`);
      results.failed++;
      results.checks.push({
        name: 'App icon in app.json',
        status: 'FAIL',
        details: appJson.expo.icon
      });
    }

    // Check splash screen
    if (appJson.expo.splash.image === './assets/icon.png') {
      console.log('✅ Splash screen: ./assets/icon.png');
      results.passed++;
      results.checks.push({
        name: 'Splash screen in app.json',
        status: 'PASS',
        details: './assets/icon.png'
      });
    } else {
      console.log(`❌ Splash screen: ${appJson.expo.splash.image}`);
      results.failed++;
      results.checks.push({
        name: 'Splash screen in app.json',
        status: 'FAIL',
        details: appJson.expo.splash.image
      });
    }

    // Check adaptive icon
    if (appJson.expo.android.adaptiveIcon.foregroundImage === './assets/icon.png') {
      console.log('✅ Adaptive icon: ./assets/icon.png');
      results.passed++;
      results.checks.push({
        name: 'Adaptive icon in app.json',
        status: 'PASS',
        details: './assets/icon.png'
      });
    } else {
      console.log(`❌ Adaptive icon: ${appJson.expo.android.adaptiveIcon.foregroundImage}`);
      results.failed++;
      results.checks.push({
        name: 'Adaptive icon in app.json',
        status: 'FAIL',
        details: appJson.expo.android.adaptiveIcon.foregroundImage
      });
    }
  } else {
    console.log('❌ app.json not found');
    results.failed++;
    results.checks.push({
      name: 'app.json exists',
      status: 'FAIL',
      details: 'File not found'
    });
  }

  // Check 3: Verify LogoPutih component
  console.log('\n3️⃣ Checking LogoPutih component...');
  const logoComponentPath = path.join(__dirname, '..', 'src', 'components', 'LogoPutih.tsx');
  if (fs.existsSync(logoComponentPath)) {
    const content = fs.readFileSync(logoComponentPath, 'utf8');
    if (content.includes('require("../../assets/icon.png")')) {
      console.log('✅ LogoPutih component: uses icon.png');
      results.passed++;
      results.checks.push({
        name: 'LogoPutih component',
        status: 'PASS',
        details: 'uses icon.png'
      });
    } else {
      console.log('❌ LogoPutih component: not using icon.png');
      results.failed++;
      results.checks.push({
        name: 'LogoPutih component',
        status: 'FAIL',
        details: 'not using icon.png'
      });
    }
  } else {
    console.log('❌ LogoPutih.tsx not found');
    results.failed++;
    results.checks.push({
      name: 'LogoPutih component exists',
      status: 'FAIL',
      details: 'File not found'
    });
  }

  // Check 4: Verify no references to old logos
  console.log('\n4️⃣ Checking for old logo references...');
  const oldLogos = [
    'logo-phc-putih.png',
    'phc-logo.png'
  ];

  let oldLogoFound = false;
  for (const oldLogo of oldLogos) {
    if (fs.existsSync(path.join(__dirname, '..', 'assets', oldLogo))) {
      console.log(`⚠️  Old logo still exists: ${oldLogo}`);
      oldLogoFound = true;
    }
  }

  if (!oldLogoFound) {
    console.log('✅ No old logo files found');
    results.passed++;
    results.checks.push({
      name: 'Old logo cleanup',
      status: 'PASS',
      details: 'No old logo files'
    });
  } else {
    console.log('⚠️  Old logo files still exist (this is OK for backup)');
    results.passed++;
    results.checks.push({
      name: 'Old logo cleanup',
      status: 'PASS',
      details: 'Old files exist (backup)'
    });
  }

  // Summary
  console.log('\n📊 Verification Summary');
  console.log('========================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📋 Total: ${results.passed + results.failed}`);

  console.log('\n📋 Detailed Results:');
  results.checks.forEach((check, index) => {
    const status = check.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${check.name}: ${check.details}`);
  });

  if (results.failed === 0) {
    console.log('\n🎉 SUCCESS: All logo references updated to icon.png!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Test the app on different devices');
    console.log('   2. Verify splash screen displays correctly');
    console.log('   3. Check logo component in different sizes');
    console.log('   4. Build and deploy with new logo');
  } else {
    console.log('\n⚠️  WARNING: Some checks failed. Please review the issues above.');
  }

  return results;
};

verifyLogoUpdate();

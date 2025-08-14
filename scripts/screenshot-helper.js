#!/usr/bin/env node

/**
 * Screenshot Helper - Tool sederhana untuk mengambil screenshot
 * Mendukung iOS Simulator dan Android Emulator
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '..', 'screenshots', 'app-screens');

// Pastikan direktori screenshot ada
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

class ScreenshotTool {
  constructor() {
    this.platform = null;
    this.deviceId = null;
    this.counter = 1;
  }

  detectPlatform() {
    try {
      // Check iOS Simulator
      execSync('xcrun simctl list devices | grep Booted', { stdio: 'pipe' });
      this.platform = 'ios';
      console.log('✅ iOS Simulator terdeteksi');
      return true;
    } catch (error) {
      // Check Android Emulator
      try {
        const output = execSync('adb devices', { encoding: 'utf8' });
        if (output.includes('device') && !output.includes('offline')) {
          this.platform = 'android';
          console.log('✅ Android Emulator terdeteksi');
          return true;
        }
      } catch (adbError) {
        console.log('❌ ADB tidak ditemukan');
      }
    }
    
    console.log('❌ Tidak ada simulator/emulator yang aktif');
    return false;
  }

  takeScreenshot(name = null) {
    if (!this.platform) {
      console.log('❌ Platform tidak terdeteksi');
      return false;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenName = name || `screenshot_${String(this.counter).padStart(3, '0')}`;
    const filename = `${screenName}_${timestamp}.png`;
    const filepath = path.join(screenshotDir, filename);

    try {
      if (this.platform === 'ios') {
        execSync(`xcrun simctl io booted screenshot "${filepath}"`, { stdio: 'pipe' });
      } else if (this.platform === 'android') {
        const tempPath = `/sdcard/temp_screenshot.png`;
        execSync(`adb shell screencap -p ${tempPath}`, { stdio: 'pipe' });
        execSync(`adb pull ${tempPath} "${filepath}"`, { stdio: 'pipe' });
        execSync(`adb shell rm ${tempPath}`, { stdio: 'pipe' });
      }

      console.log(`📸 Screenshot berhasil: ${filename}`);
      this.counter++;
      return true;
    } catch (error) {
      console.log(`❌ Gagal mengambil screenshot: ${error.message}`);
      return false;
    }
  }

  async interactiveMode() {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n🎯 MODE INTERAKTIF');
    console.log('Commands:');
    console.log('  ENTER atau "s" - Ambil screenshot');
    console.log('  "name <nama>" - Ambil screenshot dengan nama custom');
    console.log('  "quit" atau "q" - Keluar');

    const askCommand = () => {
      return new Promise(resolve => {
        readline.question('\n> ', resolve);
      });
    };

    while (true) {
      const command = await askCommand();
      const cmd = command.trim().toLowerCase();

      if (cmd === 'quit' || cmd === 'q') {
        console.log('👋 Selamat tinggal!');
        break;
      } else if (cmd === '' || cmd === 's' || cmd === 'screenshot') {
        this.takeScreenshot();
      } else if (cmd.startsWith('name ')) {
        const name = command.slice(5).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        this.takeScreenshot(name);
      } else if (cmd === 'help' || cmd === 'h') {
        console.log('\nCommands:');
        console.log('  ENTER atau "s" - Ambil screenshot');
        console.log('  "name <nama>" - Ambil screenshot dengan nama custom');
        console.log('  "quit" atau "q" - Keluar');
      } else {
        console.log('❓ Command tidak dikenal. Ketik "help" untuk bantuan.');
      }
    }

    readline.close();
  }

  async autoMode(interval = 5000) {
    console.log(`\n🤖 MODE OTOMATIS (Interval: ${interval/1000} detik)`);
    console.log('Tekan Ctrl+C untuk menghentikan');

    const takeAutoScreenshot = () => {
      this.takeScreenshot();
      setTimeout(takeAutoScreenshot, interval);
    };

    // Tunggu 3 detik sebelum mulai
    console.log('⏳ Memulai dalam 3 detik...');
    setTimeout(takeAutoScreenshot, 3000);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Dihentikan oleh user');
      process.exit(0);
    });
  }

  listScreenshots() {
    const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
    
    if (files.length === 0) {
      console.log('📁 Tidak ada screenshot ditemukan');
      return;
    }

    console.log(`\n📸 Ditemukan ${files.length} screenshot:`);
    files.forEach((file, index) => {
      const stats = fs.statSync(path.join(screenshotDir, file));
      console.log(`${index + 1}. ${file} (${stats.size} bytes) - ${stats.mtime.toLocaleString()}`);
    });
  }

  clearScreenshots() {
    const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
    
    if (files.length === 0) {
      console.log('📁 Tidak ada screenshot untuk dihapus');
      return;
    }

    files.forEach(file => {
      fs.unlinkSync(path.join(screenshotDir, file));
    });

    console.log(`🗑️  ${files.length} screenshot berhasil dihapus`);
  }
}

async function main() {
  console.log('📱 PHC Mobile Screenshot Tool');
  console.log('============================\n');

  const tool = new ScreenshotTool();

  if (!tool.detectPlatform()) {
    console.log('\n💡 Tips:');
    console.log('- Untuk iOS: Buka iOS Simulator dan jalankan aplikasi');
    console.log('- Untuk Android: Buka Android Emulator dan pastikan ADB terinstall');
    return;
  }

  console.log(`📁 Screenshots akan disimpan di: ${screenshotDir}\n`);

  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  node screenshot-helper.js                 # Interactive mode');
    console.log('  node screenshot-helper.js --auto [interval] # Auto mode');
    console.log('  node screenshot-helper.js --single [name] # Single screenshot');
    console.log('  node screenshot-helper.js --list         # List screenshots');
    console.log('  node screenshot-helper.js --clear        # Clear all screenshots');
    return;
  }

  if (args.includes('--list')) {
    tool.listScreenshots();
  } else if (args.includes('--clear')) {
    tool.clearScreenshots();
  } else if (args.includes('--single')) {
    const nameIndex = args.indexOf('--single') + 1;
    const name = args[nameIndex] || null;
    tool.takeScreenshot(name);
  } else if (args.includes('--auto')) {
    const intervalIndex = args.indexOf('--auto') + 1;
    const interval = parseInt(args[intervalIndex]) * 1000 || 5000;
    await tool.autoMode(interval);
  } else {
    // Default: Interactive mode
    await tool.interactiveMode();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

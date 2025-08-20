const fs = require('fs');
const path = require('path');

// Patterns to find and fix
const patterns = [
  {
    name: 'response.data.map without array check',
    pattern: /if\s*\(\s*response\.success\s*&&\s*response\.data\s*\)\s*{\s*\n\s*response\.data\.map/g,
    replacement: 'if (response.success && response.data && Array.isArray(response.data)) {\n        response.data.map'
  },
  {
    name: 'response.data.forEach without array check',
    pattern: /if\s*\(\s*response\.success\s*&&\s*response\.data\s*\)\s*{\s*\n\s*response\.data\.forEach/g,
    replacement: 'if (response.success && response.data && Array.isArray(response.data)) {\n        response.data.forEach'
  },
  {
    name: 'response.data.slice without array check',
    pattern: /if\s*\(\s*response\.success\s*&&\s*response\.data\s*\)\s*{\s*\n\s*response\.data\.slice/g,
    replacement: 'if (response.success && response.data && Array.isArray(response.data)) {\n        response.data.slice'
  },
  {
    name: 'response.data.reduce without array check',
    pattern: /if\s*\(\s*response\.success\s*&&\s*response\.data\s*\)\s*{\s*\n\s*response\.data\.reduce/g,
    replacement: 'if (response.success && response.data && Array.isArray(response.data)) {\n        response.data.reduce'
  }
];

function findAndFixFiles(dir) {
  const files = fs.readdirSync(dir);
  let fixedFiles = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fixedFiles = fixedFiles.concat(findAndFixFiles(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;
        
        patterns.forEach(pattern => {
          if (pattern.pattern.test(newContent)) {
            newContent = newContent.replace(pattern.pattern, pattern.replacement);
            modified = true;
            console.log(`✅ Fixed ${pattern.name} in ${filePath}`);
          }
        });
        
        if (modified) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          fixedFiles.push(filePath);
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  });
  
  return fixedFiles;
}

function main() {
  console.log('🔧 Memulai perbaikan response.data errors...');
  console.log('=' .repeat(50));
  
  const srcDir = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Directory src tidak ditemukan');
    return;
  }
  
  const fixedFiles = findAndFixFiles(srcDir);
  
  console.log('\n📊 Hasil Perbaikan:');
  console.log('=' .repeat(50));
  console.log(`✅ Total file yang diperbaiki: ${fixedFiles.length}`);
  
  if (fixedFiles.length > 0) {
    console.log('\n📝 File yang diperbaiki:');
    fixedFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('🎉 Tidak ada file yang perlu diperbaiki!');
  }
  
  console.log('\n💡 Tips:');
  console.log('- Restart development server');
  console.log('- Test aplikasi untuk memastikan tidak ada error');
  console.log('- Commit perubahan jika sudah yakin');
}

main();

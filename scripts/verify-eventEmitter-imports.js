const fs = require('fs');
const path = require('path');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkEventEmitterImports() {
  console.log('🔍 Checking eventEmitter imports...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findFiles(srcDir);
  
  let correctImports = 0;
  let incorrectImports = 0;
  let totalFiles = 0;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for eventEmitter imports
    const importMatches = content.match(/import.*eventEmitter.*from.*['"]/g);
    
    if (importMatches) {
      totalFiles++;
      console.log(`📁 ${path.relative(process.cwd(), file)}`);
      
      importMatches.forEach(match => {
        if (match.includes('{ eventEmitter }')) {
          console.log(`   ❌ Incorrect: ${match.trim()}`);
          incorrectImports++;
        } else if (match.includes('eventEmitter')) {
          console.log(`   ✅ Correct: ${match.trim()}`);
          correctImports++;
        }
      });
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Total files with eventEmitter imports: ${totalFiles}`);
  console.log(`   Correct imports: ${correctImports}`);
  console.log(`   Incorrect imports: ${incorrectImports}`);
  
  if (incorrectImports === 0) {
    console.log('\n🎉 All eventEmitter imports are correct!');
  } else {
    console.log('\n⚠️  Some eventEmitter imports need to be fixed.');
  }
}

// Run the verification
checkEventEmitterImports();

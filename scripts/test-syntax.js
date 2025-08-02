const fs = require('fs');

/**
 * Script untuk test syntax file secara manual
 */

function testSyntax(filePath) {
  console.log(`🔍 Testing syntax for: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for basic syntax issues
    const issues = [];
    
    // Check for unclosed brackets/parentheses
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openSquare = (content.match(/\[/g) || []).length;
    const closeSquare = (content.match(/\]/g) || []).length;
    
    if (openBrackets !== closeBrackets) {
      issues.push(`Bracket mismatch: ${openBrackets} open, ${closeBrackets} close`);
    }
    
    if (openParens !== closeParens) {
      issues.push(`Parentheses mismatch: ${openParens} open, ${closeParens} close`);
    }
    
    if (openSquare !== closeSquare) {
      issues.push(`Square bracket mismatch: ${openSquare} open, ${closeSquare} close`);
    }
    
    // Check for common JSX syntax issues
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for unclosed JSX tags
      if (line.includes('<') && !line.includes('>')) {
        issues.push(`Line ${lineNum}: Possible unclosed JSX tag`);
      }
      
      // Check for missing closing tags
      if (line.includes('{') && line.includes('}') && line.includes('(') && !line.includes(')')) {
        issues.push(`Line ${lineNum}: Possible missing closing parenthesis`);
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ No obvious syntax issues found');
    } else {
      console.log('❌ Potential syntax issues:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return issues.length === 0;
    
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
    return false;
  }
}

// Test the DailyMissionScreen file
const filePath = 'src/screens/DailyMissionScreen.tsx';
const isSyntaxValid = testSyntax(filePath);

console.log(`\n📊 Result: ${isSyntaxValid ? '✅ Syntax appears valid' : '❌ Syntax issues detected'}`);

if (isSyntaxValid) {
  console.log('💡 Try running the app now to see if it works');
} else {
  console.log('🔧 Fix the syntax issues before running the app');
} 
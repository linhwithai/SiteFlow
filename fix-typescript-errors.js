#!/usr/bin/env node

/**
 * Script to fix common TypeScript errors
 */

const fs = require('fs');
const path = require('path');

// Common fixes for TypeScript errors
const fixes = [
  {
    pattern: /logger\.(debug|info|warn|error)\(([^,]+),\s*\{([^}]+)\}\);/g,
    replacement: 'logger.$1($2, { $3 });',
    description: 'Fix logger calls with object parameters'
  },
  {
    pattern: /if\s*\(\s*!(\w+)\.(\w+)\s*\|\|\s*!(\w+)\.(\w+)\s*\)/g,
    replacement: 'if (!$1 || !$1.$2 || !$3 || !$3.$4)',
    description: 'Fix null checks for nested properties'
  },
  {
    pattern: /(\w+):\s*data\.(\w+),/g,
    replacement: (match, prop, dataProp) => {
      if (prop.includes('Date') || prop.includes('At')) {
        return `${prop}: new Date(data.${dataProp}),`;
      }
      return match;
    },
    description: 'Fix date conversions'
  },
  {
    pattern: /(\w+):\s*data\.(\w+)\s*\|\|\s*undefined,/g,
    replacement: (match, prop, dataProp) => {
      if (prop.includes('Hours') || prop.includes('Count')) {
        return `${prop}: data.${dataProp} ?? 0,`;
      }
      return match;
    },
    description: 'Fix undefined number assignments'
  }
];

// Files to fix
const filesToFix = [
  'src/hooks/useDailyLogs.ts',
  'src/hooks/useParallelDataFetching.ts',
  'src/libs/ApiMiddleware.ts',
  'src/libs/Cache.ts',
  'src/libs/RateLimiter.ts',
  'src/components/ProjectOverview.tsx',
  'src/app/[locale]/(auth)/dashboard/projects/[id]/page.tsx'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`✅ Applied fix: ${fix.description} in ${filePath}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`🔧 Fixed: ${filePath}`);
    } else {
      console.log(`ℹ️  No fixes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting TypeScript error fixes...\n');

  filesToFix.forEach(fixFile);

  console.log('\n✨ TypeScript fixes completed!');
  console.log('\nNext steps:');
  console.log('1. Run: npx tsc --noEmit');
  console.log('2. Check for remaining errors');
  console.log('3. Fix any remaining issues manually');
}

main();


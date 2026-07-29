import fs from 'fs';

const htmlPath = 'c:/FLN2/backend/fln-backend/app/index.html';
const content = fs.readFileSync(htmlPath, 'utf-8');

// Regex to find all type:'...' in level definitions
const typeMatches = Array.from(content.matchAll(/type:\s*['"]([^'"]+)['"]/g)).map(m => m[1]);
const uniqueTypes = Array.from(new Set(typeMatches)).sort();

console.log(`Found ${uniqueTypes.length} UNIQUE WORKSHEET SECTION TYPES across all 59 FLN levels:\n`);
uniqueTypes.forEach((t, i) => {
  console.log(`${(i + 1).toString().padStart(2, ' ')}. ${t}`);
});

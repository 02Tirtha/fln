const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/IcrScanner.tsx', 'utf8');
let upstream = fs.readFileSync('temp.txt', 'utf8');

// Insert DonutChart code
const donutStart = upstream.indexOf('const DonutChart: React.FC');
const donutEnd = upstream.indexOf('export const IcrScanner');
if (donutStart !== -1 && donutEnd !== -1) {
  const donutChartCode = upstream.substring(donutStart, donutEnd);
  if (!content.includes('const DonutChart')) {
    content = content.replace('export const IcrScanner', donutChartCode + '\nexport const IcrScanner');
  }
}

// Replace text
content = content.replace('Class-Wide EasyOCR Evaluation Complete', 'Class-Wide OCR Evaluation Complete');
content = content.replace('via Fast PyTorch EasyOCR Engine.', 'via Fast PyTorch OCR Engine.');
content = content.replace('ICR EasyOCR Evaluation Complete', 'ICR Evaluation Complete');

// Replace the 3 column grid
const gridStartStr = '<div className="grid grid-cols-3 gap-4 border-y border-zinc-200 dark:border-zinc-700 py-4">';
const gridStartIdx = content.indexOf(gridStartStr);

if (gridStartIdx !== -1) {
  // We need to find where the old grid ends
  const afterGridIdx = content.indexOf('{questions.length > 0 && (', gridStartIdx);
  if (afterGridIdx !== -1) {
    // Extract replacement from upstream
    const spaceY4StartStr = '<div className="space-y-4">';
    const spaceY4StartIdx = upstream.indexOf(spaceY4StartStr);
    const spaceY4EndIdx = upstream.indexOf('{questions.length > 0 && (', spaceY4StartIdx);
    
    if (spaceY4StartIdx !== -1 && spaceY4EndIdx !== -1) {
      const newGridCode = upstream.substring(spaceY4StartIdx, spaceY4EndIdx).trim() + '\n\n              ';
      
      content = content.substring(0, gridStartIdx) + newGridCode + content.substring(afterGridIdx);
    }
  }
}

fs.writeFileSync('frontend/src/components/IcrScanner.tsx', content, 'utf8');
console.log('Patched IcrScanner.tsx successfully with upstream scanner UI');

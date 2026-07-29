import conceptMap from './conceptDictionary.json';
import { aiClassifyConcept } from './conceptClassifier';

export interface BlueprintQuestion {
  question: string;
  answer: string;
  topic: string;
  aiGenerated: boolean;
  needsReview?: boolean;
  answerMode?: 'text' | 'dropdown';
  options?: string[];
  remediation?: string;
}

export function getHumanReadableRemediation(concept: string, questionText: string = ''): string {
  const c = (concept || '').toLowerCase();

  if (c.includes('tally') || c.includes('tallies')) {
    return 'Count each group of 5 tally marks (||||/) as 5, then add single vertical tally marks (|) to find the total count.';
  }
  if (c.includes('finger') || c.includes('fruit') || c.toLowerCase().includes('matchfingerstofruits')) {
    return 'Match each finger name (Thumb, Index, Middle, Ring, Little) to its corresponding item in the options list.';
  }
  if (c.includes('add and match') || c.includes('addition and match')) {
    return 'Calculate the sum of the numbers and select the matching answer option.';
  }
  if (c.includes('addition') || c.includes('add')) {
    return 'Line up numbers vertically by place value (ones, tens) and add digits starting from the right. Carry over when sum is 10 or more.';
  }
  if (c.includes('subtraction') || c.includes('subtract') || c.includes('minus')) {
    return 'Line up numbers by place value and subtract right-to-left. Borrow 1 ten from the left if top digit is smaller than bottom digit.';
  }
  if (c.includes('multiplication') || c.includes('multiply') || c.includes('times')) {
    return 'Multiply numbers using basic multiplication facts. For multi-digit numbers, multiply by place values and add products.';
  }
  if (c.includes('division') || c.includes('divide')) {
    return 'Divide into equal groups or calculate how many times the divisor fits into the dividend.';
  }
  if (c.includes('algebra')) {
    return 'Solve linear equations by performing inverse operations to isolate the variable x on one side.';
  }
  if (c.includes('fraction')) {
    return 'Remember: the top number (numerator) represents shaded parts, and bottom number (denominator) represents total equal parts.';
  }
  if (c.includes('factor')) {
    return 'Factors are whole numbers that divide evenly into a number without leaving a remainder.';
  }
  if (c.includes('multiple')) {
    return 'Multiples of a number are produced by multiplying it by whole numbers (1, 2, 3...).';
  }
  if (c.includes('place value')) {
    return 'Identify the position of each digit: Hundreds, Tens, and Ones/Units.';
  }
  if (c.includes('geometry') || c.includes('shape') || c.includes('angle')) {
    if (/\b(angle|angles|degree|degrees|protractor|90|acute|obtuse|right)\b/i.test(questionText)) {
      return 'An angle measures the turn between two lines meeting at a point: Right angle (90°), Acute angle (< 90°), Obtuse angle (> 90°), Straight angle (180°).';
    }
    return 'Observe the number of sides, corners, and properties of geometric shapes.';
  }
  if (c.includes('time') || c.includes('clock')) {
    return 'Look at the short hour hand first for the hour, then the long minute hand for minutes (12 = 00 mins, 6 = 30 mins).';
  }
  if (c.includes('ordinal')) {
    return 'Ordinal numbers show position in a series (1st = first, 2nd = second, 3rd = third...).';
  }
  if (c.includes('decimal')) {
    return 'The decimal point separates whole numbers on the left from tenths and hundredths on the right.';
  }
  if (c.includes('percent')) {
    return 'Percentage means parts out of 100. Multiply the total by the fraction (percent / 100).';
  }
  if (c.includes('ratio')) {
    return 'A ratio compares two quantities by division (written as a:b). Simplify by dividing both by their common factor.';
  }
  if (c.includes('statistic') || c.includes('mean') || c.includes('average')) {
    return 'To find the mean average, add all values together and divide the total by the number of items.';
  }
  if (c.includes('probabil')) {
    return 'Probability measures how likely an event is to happen: (Favorable Outcomes / Total Possible Outcomes).';
  }
  if (c.includes('integer')) {
    return 'Integers include positive numbers, zero, and negative numbers. Use the number line to add and subtract.';
  }
  if (c.includes('ordering')) {
    return 'Order numbers by comparing place values from left to right (smallest to largest for ascending, largest to smallest for descending).';
  }
  if (c.includes('comparison') || c.includes('compare')) {
    return 'Compare quantities using symbols: > (greater than), < (less than), and = (equal to).';
  }

  return `Review the basic principles for "${concept || 'this topic'}". Break down the question step-by-step with your teacher.`;
}

// ─── Concept Dictionary ────────────────────────────────────────────────────────
// Loaded from conceptDictionary.json — add new concepts there, not here.
export const CONCEPT_MAP: Record<string, string[]> = conceptMap as Record<string, string[]>;

// ─── DROPDOWN CONCEPTS ────────────────────────────────────────────────────────
// Concepts where the answer is best selected from a list, not typed freely.
const DROPDOWN_CONCEPTS = new Set([
  'fractions',
  'complete the whole',
  'measurement',
  'unit conversion',
  'percentages',
  'geometry',
  'time',
  'probability',
  'match fingers to fruits',
  'matchfingerstofruits',
  'add and match',
  'addandmatch',
  'match the tallies',
  'matchthetallies',
  'tally marks',
  'tally',
]);

/**
 * Returns 'dropdown' for concepts with discrete answer choices (e.g. Fractions,
 * Measurement units), and 'text' for everything else.
 */
export function getAnswerMode(concept: string): 'text' | 'dropdown' {
  return DROPDOWN_CONCEPTS.has((concept || '').toLowerCase()) ? 'dropdown' : 'text';
}

/**
 * Strip answer-option markers and "Choose:" prompts from scanned question text
 * so stored questions are clean and don't trigger dropdown rendering by accident.
 */
export function sanitizeQuestionText(text: string): string {
  return (text || '')
    .replace(/☑|☐/g, '')
    .replace(/\bChoose:\s*/gi, '')
    .replace(/\(Choose:[^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function normalizeQuestionText(text: string): string {
  return (text || '')
    .replace(/[\s—–-]*item\s*\d+/gi, '')
    .replace(/[\s—–-]*question\s*\d+/gi, '')
    .trim()
    .toLowerCase();
}

function getFactors(n: number): number[] {
  const res: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) res.push(i);
  return res;
}

function getMultiples(n: number, count: number): number[] {
  const res: number[] = [];
  for (let i = 1; i <= count; i++) res.push(n * i);
  return res;
}

// ─── detectConcept ─────────────────────────────────────────────────────────────
/**
 * Unified concept detection workflow:
 *  1. Keyword detection from CONCEPT_MAP / registry
 *  2. Caller's hintConcept fallback
 *  3. AI / NLP Concept Classifier fallback (`aiClassifyConcept`)
 *  4. Default to 'General'
 */
export function detectConcept(questionText: string, hintConcept: string = ''): string {
  // 1. Respect explicit hintConcept if provided
  if (hintConcept && hintConcept.trim() && hintConcept.toLowerCase() !== 'general') {
    const hintLow = hintConcept.toLowerCase().trim();
    for (const concept in CONCEPT_MAP) {
      if (concept.toLowerCase() === hintLow) {
        return concept;
      }
    }
    return hintConcept;
  }

  const normQ = normalizeQuestionText(questionText);
  const q = normQ.toLowerCase();

  // 2. Keyword detection
  const allEntries: Array<{ concept: string; keyword: string }> = [];
  for (const concept in CONCEPT_MAP) {
    const entry = CONCEPT_MAP[concept];
    const keywords: string[] = Array.isArray(entry) ? entry : ((entry as any)?.keywords || []);
    for (const keyword of keywords) {
      if (keyword && keyword.trim()) {
        allEntries.push({ concept, keyword: keyword.toLowerCase().trim() });
      }
    }
  }
  allEntries.sort((a, b) => b.keyword.length - a.keyword.length);

  for (const { concept, keyword } of allEntries) {
    if (q.includes(keyword)) {
      return concept;
    }
  }

  // 3. AI / NLP Classifier Fallback for new / un-mapped question text
  const classified = aiClassifyConcept(questionText);
  if (classified) {
    return classified;
  }

  // 4. Default
  return 'General';
}

/**
 * Multi-concept detection workflow:
 * Extracts ALL concepts present in compound/multi-concept questions (e.g. Add and Subtract Match).
 */
export function detectMultiConcepts(questionText: string, hintConcept: string = ''): string[] {
  const normQ = normalizeQuestionText(questionText);
  const q = normQ.toLowerCase();
  const detected = new Set<string>();

  const allEntries: Array<{ concept: string; keyword: string }> = [];
  for (const concept in CONCEPT_MAP) {
    const entry = CONCEPT_MAP[concept];
    const keywords: string[] = Array.isArray(entry) ? entry : ((entry as any)?.keywords || []);
    for (const keyword of keywords) {
      if (keyword && keyword.trim()) {
        allEntries.push({ concept, keyword: keyword.toLowerCase().trim() });
      }
    }
  }
  allEntries.sort((a, b) => b.keyword.length - a.keyword.length);

  for (const { concept, keyword } of allEntries) {
    if (q.includes(keyword)) {
      detected.add(concept);
    }
  }

  if (hintConcept) {
    const hintLow = hintConcept.toLowerCase();
    for (const concept in CONCEPT_MAP) {
      if (concept.toLowerCase() === hintLow) {
        detected.add(concept);
      }
    }
  }

  if (detected.size === 0) {
    const classified = aiClassifyConcept(questionText);
    if (classified) detected.add(classified);
  }

  if (detected.size === 0) {
    detected.add('General');
  }

  return Array.from(detected);
}

// ─── CONCEPT GENERATOR DEFINITIONS ─────────────────────────────────────────────
export type ConceptGenerator = (
  variantIndex: number,
  originalQ?: string,
  originalAnswer?: string
) => BlueprintQuestion;

const generateFractions: ConceptGenerator = (v) => {
  const presets = [
    { q: 'What fraction of a shape is shaded when 1 out of 2 equal parts is shaded? (Choose: 1/2, 1/3, or 1/4)', ans: '1/2' },
    { q: 'What fraction of a shape is shaded when 3 out of 4 equal parts are shaded? (Choose: 1/4, 2/4, or 3/4)', ans: '3/4' },
    { q: 'What fraction of a shape is shaded when 2 out of 3 equal parts are shaded? (Choose: 1/3, 2/3, or 3/3)', ans: '2/3' },
    { q: 'What fraction of a shape is shaded when 1 out of 4 equal parts is shaded? (Choose: 1/4, 2/4, or 3/4)', ans: '1/4' },
    { q: 'What fraction of a shape is shaded when 1 out of 3 equal parts is shaded? (Choose: 1/3, 2/3, or 3/3)', ans: '1/3' },
  ];
  const p = presets[v % presets.length];
  return { question: p.q, answer: p.ans, topic: 'Fractions', aiGenerated: false };
};

const generateDirections: ConceptGenerator = (v) => {
  const directions = ['North', 'East', 'South', 'West'] as const;
  const places: Record<typeof directions[number], string> = {
    'North': 'Park',
    'East': 'Library',
    'South': 'Bus Stop',
    'West': 'Clock Tower'
  };
  const dir = directions[v % directions.length];
  return {
    question: `Which place is ${dir} of the School?`,
    answer: places[dir],
    topic: 'Directions',
    aiGenerated: false
  };
};

const generateShortestPath: ConceptGenerator = (v) => {
  const routes = [
    { q: 'Which is the shortest path from School to Park? (Choose: North route [400m] or East route [700m])', ans: 'North route' },
    { q: 'Which is the shortest path from Library to Bus Stop? (Choose: Direct South route [300m] or West route [800m])', ans: 'Direct South route' },
    { q: 'Which is the shortest path from Market to Station? (Choose: Main Road [500m] or Bypass [900m])', ans: 'Main Road' },
    { q: 'Which is the shortest path from Home to School? (Choose: Footpath [250m] or Highway [600m])', ans: 'Footpath' }
  ];
  const r = routes[v % routes.length];
  return { question: r.q, answer: r.ans, topic: 'Shortest Path', aiGenerated: false };
};

const generateMapInterpretation: ConceptGenerator = (v) => {
  const mapQuestions = [
    { q: 'On the city map, which building is located next to the Library?', ans: 'Post Office' },
    { q: 'On the park map, what feature is in the center of the park?', ans: 'Fountain' },
    { q: 'According to the legend on the map, what does the blue line represent?', ans: 'River' },
    { q: 'On the school layout map, where is the playground located?', ans: 'Behind Main Building' }
  ];
  const mq = mapQuestions[v % mapQuestions.length];
  return { question: mq.q, answer: mq.ans, topic: 'Map Interpretation', aiGenerated: false };
};

const generateCommonFactors: ConceptGenerator = (v) => {
  const a = (v % 5) * 6 + 12;
  const b = (v % 5) * 4 + 18;
  const factorsA = getFactors(a);
  const factorsB = getFactors(b);
  const common = factorsA.filter(f => factorsB.includes(f));
  return {
    question: `Find the common factors of ${a} and ${b}.`,
    answer: common.join(', '),
    topic: 'Common Factors',
    aiGenerated: false
  };
};

const generateFactors: ConceptGenerator = (v) => {
  const num = (v % 10) + 12; // e.g. 12–21
  const factors = getFactors(num);
  return {
    question: `List the factors of ${num}.`,
    answer: factors.join(', '),
    topic: 'Factors',
    aiGenerated: false
  };
};

const generateCommonMultiples: ConceptGenerator = (v) => {
  const a = (v % 4) + 3;
  const b = (v % 4) + 5;
  const multiplesA = getMultiples(a, 5);
  const multiplesB = getMultiples(b, 5);
  const common = multiplesA.filter(m => multiplesB.includes(m));
  return {
    question: `Find the common multiples of ${a} and ${b} (first 5 multiples).`,
    answer: common.length > 0 ? common.join(', ') : 'None in first 5 multiples',
    topic: 'Common Multiples',
    aiGenerated: false
  };
};

const generateMultiples: ConceptGenerator = (v) => {
  const num = (v % 8) + 3; // e.g. 3–10
  const multiples = getMultiples(num, 5);
  return {
    question: `List the first 5 multiples of ${num}.`,
    answer: multiples.join(', '),
    topic: 'Multiples',
    aiGenerated: false
  };
};

const generateCompleteTheWhole: ConceptGenerator = (v) => {
  const wholes = [
    { shaded: 1, total: 4 }, { shaded: 2, total: 5 }, { shaded: 3, total: 8 },
    { shaded: 1, total: 3 }, { shaded: 2, total: 6 },
  ];
  const w = wholes[v % wholes.length];
  const rem = w.total - w.shaded;
  return {
    question: `If ${w.shaded} out of ${w.total} equal parts are shaded, how many MORE parts must be shaded to complete the whole (${w.total}/${w.total})?`,
    answer: `${rem} parts`,
    topic: 'Fractions (Complete the Whole)',
    aiGenerated: false
  };
};

const generatePlaceValue: ConceptGenerator = (v) => {
  const num = 100 + v * 7;
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;
  return {
    question: `Write ${num} in Hundreds, Tens, and Ones (HTO) form.`,
    answer: `${h} Hundreds, ${t} Tens, ${o} Ones`,
    topic: 'Place Value',
    aiGenerated: false
  };
};

const generateNumberSense: ConceptGenerator = (v) => {
  const base = (v + 1) * 3 + 10;
  const presets = [
    { q: `What number comes AFTER ${base}?`, ans: String(base + 1) },
    { q: `What number comes BEFORE ${base + 5}?`, ans: String(base + 4) },
    { q: `What number is BETWEEN ${base} and ${base + 2}?`, ans: String(base + 1) },
  ];
  const p = presets[v % presets.length];
  return { question: p.q, answer: p.ans, topic: 'Number Sense', aiGenerated: false };
};

const generateOrdering: ConceptGenerator = (v, originalQ = '') => {
  const is3Digit = /\b3-digit\b|\b3digit\b|\bhundreds\b|\bhto\b|\b\d{3}\b/i.test(originalQ);
  const isAsc = v % 2 === 0;

  if (is3Digit) {
    const raw3 = [(v % 5) * 110 + 215, (v % 5) * 95 + 430, (v % 5) * 140 + 125, (v % 5) * 80 + 350];
    const sorted3 = isAsc ? [...raw3].sort((a, b) => a - b) : [...raw3].sort((a, b) => b - a);
    return {
      question: `Arrange the 3-digit numbers in ${isAsc ? 'ASCENDING (smallest to largest)' : 'DESCENDING (largest to smallest)'} order: [ ${raw3.join(', ')} ]`,
      answer: sorted3.join(', '),
      topic: `Ordering (${isAsc ? 'Ascending' : 'Descending'})`,
      aiGenerated: false
    };
  }

  const base = (v + 1) * 6 + 12;
  const raw = [base + 22, base + 4, base + 15, base + 31];
  const sorted = isAsc ? [...raw].sort((a, b) => a - b) : [...raw].sort((a, b) => b - a);
  return {
    question: `Arrange the numbers in ${isAsc ? 'ASCENDING (smallest to largest)' : 'DESCENDING (largest to smallest)'} order: [ ${raw.join(', ')} ]`,
    answer: sorted.join(', '),
    topic: `Ordering (${isAsc ? 'Ascending' : 'Descending'})`,
    aiGenerated: false
  };
};

const generateComparison: ConceptGenerator = (v) => {
  const vA = (v + 1) * 9 + 14;
  const vB = (v + 1) * 7 + 19;
  const isGreater = v % 2 === 0;
  return {
    question: `Which number is ${isGreater ? 'GREATER' : 'SMALLER'}? ${vA} or ${vB}?`,
    answer: String(isGreater ? Math.max(vA, vB) : Math.min(vA, vB)),
    topic: 'Comparison',
    aiGenerated: false
  };
};

const generateAddition: ConceptGenerator = (v, originalQ = '') => {
  const is3Digit = /\b3-digit\b|\b3digit\b|\bcarry\b|\bcarrying\b|\bhundreds\b|\bhto\b|\b\d{3}\b/i.test(originalQ);
  if (is3Digit) {
    const a3 = (v % 5) * 65 + 215;
    const b3 = (v % 5) * 45 + 138;
    return { question: `Solve 3-digit carry addition: ${a3} + ${b3} = ?`, answer: String(a3 + b3), topic: 'Addition', aiGenerated: false };
  }
  const a = (v + 1) * 7 + 18;
  const b = (v + 1) * 5 + 14;
  return { question: `Solve addition: ${a} + ${b} = ?`, answer: String(a + b), topic: 'Addition', aiGenerated: false };
};

const generateSubtraction: ConceptGenerator = (v, originalQ = '') => {
  const is3Digit = /\b3-digit\b|\b3digit\b|\bborrow\b|\bborrowing\b|\bhundreds\b|\bhto\b|\b\d{3}\b/i.test(originalQ);
  if (is3Digit) {
    const sA3 = (v % 5) * 75 + 435;
    const sB3 = (v % 5) * 35 + 148;
    return { question: `Solve 3-digit borrow subtraction: ${sA3} - ${sB3} = ?`, answer: String(sA3 - sB3), topic: 'Subtraction', aiGenerated: false };
  }
  const sA = (v + 1) * 8 + 35;
  const sB = (v + 1) * 4 + 12;
  return { question: `Find the difference: ${sA} - ${sB} = ?`, answer: String(sA - sB), topic: 'Subtraction', aiGenerated: false };
};

const generateMultiplication: ConceptGenerator = (v) => {
  const a = (v % 5) + 2;
  const b = (v % 7) + 3;
  return { question: `Solve: ${a} × ${b} = ?`, answer: String(a * b), topic: 'Multiplication', aiGenerated: false };
};

const generateDivision: ConceptGenerator = (v) => {
  const divisor = (v % 5) + 2;
  const quotient = (v % 6) + 3;
  const dividend = divisor * quotient;
  return { question: `Solve: ${dividend} ÷ ${divisor} = ?`, answer: String(quotient), topic: 'Division', aiGenerated: false };
};

const generateDivisionEqualSharing: ConceptGenerator = (v) => {
  const kids = (v % 3) + 2;
  const perKid = (v % 4) + 3;
  const total = kids * perKid;
  const items = ['cookies 🍪', 'apples 🍎', 'pencils ✏️', 'toys 🧸', 'candies 🍬'];
  return {
    question: `Share ${total} ${items[v % items.length]} equally among ${kids} children. How many does each child get?`,
    answer: String(perKid),
    topic: 'Division (Equal Sharing)',
    aiGenerated: false
  };
};

const generateDivisionEqualGrouping: ConceptGenerator = (v) => {
  const perGroup = (v % 3) + 3;
  const groups = (v % 4) + 2;
  const total = perGroup * groups;
  const objs = ['balls ⚽', 'stars ⭐', 'blocks 🧱', 'cards 🃏', 'buttons 🔘'];
  return {
    question: `Put ${total} ${objs[v % objs.length]} into equal groups of ${perGroup}. How many groups are formed?`,
    answer: String(groups),
    topic: 'Division (Equal Grouping)',
    aiGenerated: false
  };
};

const generatePatterns: ConceptGenerator = (v, originalQ = '') => {
  const isShapePattern = /\b(circle|triangle|square|shape|shapes|pattern sequence)\b/i.test(originalQ);
  if (isShapePattern) {
    const shapePats = [
      { seq: 'Circle, Triangle, Circle, Triangle, ___', opts: ['Circle', 'Triangle'], ans: 'Circle' },
      { seq: 'Square, Circle, Square, Circle, ___', opts: ['Square', 'Circle'], ans: 'Square' },
      { seq: 'Triangle, Square, Triangle, Square, ___', opts: ['Triangle', 'Square'], ans: 'Triangle' },
      { seq: 'Circle, Square, Circle, Square, ___', opts: ['Circle', 'Square'], ans: 'Circle' },
      { seq: 'Triangle, Circle, Triangle, Circle, ___', opts: ['Triangle', 'Circle'], ans: 'Triangle' },
    ];
    const sp = shapePats[v % shapePats.length];
    return {
      question: `Complete the shape pattern sequence: ${sp.seq}`,
      options: sp.opts,
      answer: sp.ans,
      topic: 'Patterns (Shape Sequences)',
      aiGenerated: false
    };
  }

  const pats = [
    { seq: '2, 4, 6, 8, __', ans: '10' },
    { seq: '5, 10, 15, 20, __', ans: '25' },
    { seq: '10, 20, 30, 40, __', ans: '50' },
    { seq: '3, 6, 9, 12, __', ans: '15' },
    { seq: '7, 14, 21, 28, __', ans: '35' },
  ];
  const p = pats[v % pats.length];
  return { question: `Complete the skip counting pattern: ${p.seq}`, answer: p.ans, topic: 'Patterns', aiGenerated: false };
};

const generateDataHandling: ConceptGenerator = (v) => {
  const presets = [
    { apples: 6, oranges: 4, ans: '2' },
    { apples: 8, oranges: 3, ans: '5' },
    { apples: 10, oranges: 6, ans: '4' },
    { apples: 7, oranges: 2, ans: '5' },
    { apples: 9, oranges: 5, ans: '4' },
  ];
  const p = presets[v % presets.length];
  return {
    question: `A pictograph chart shows ${p.apples} apples and ${p.oranges} oranges. How many more apples than oranges are there?`,
    answer: p.ans,
    topic: 'Data Handling',
    aiGenerated: false
  };
};

const generateMoney: ConceptGenerator = (v) => {
  const cost = (v + 1) * 10;
  const paid = cost + 20;
  return {
    question: `An item costs ₹${cost}. A student paid ₹${paid}. How much change does the student get back?`,
    answer: `₹${paid - cost}`,
    topic: 'Money',
    aiGenerated: false
  };
};

const generateMeasurement: ConceptGenerator = (v) => {
  const items = [
    { item: 'length of a pencil', options: 'cm or m', unit: 'cm' },
    { item: 'water in a bucket', options: 'mL or L', unit: 'L' },
    { item: 'weight of a schoolbag', options: 'g or kg', unit: 'kg' },
    { item: 'length of a classroom door', options: 'cm or m', unit: 'm' },
    { item: 'milk in a small cup', options: 'mL or L', unit: 'mL' },
  ];
  const s = items[v % items.length];
  return {
    question: `Which unit is best to measure the ${s.item}? (Choose: ${s.options})`,
    answer: s.unit,
    topic: 'Measurement',
    aiGenerated: false
  };
};

const generateUnitConversion: ConceptGenerator = (v) => {
  const m = (v + 1) * 3 + 2;
  return {
    question: `Convert meters to centimeters: ${m} meters = ? cm`,
    answer: String(m * 100),
    topic: 'Unit Conversion',
    aiGenerated: false
  };
};

const generateTime: ConceptGenerator = (v) => {
  const hour = (v % 11) + 1;
  const isHalf = v % 2 === 1;
  const handDesc = isHalf
    ? `Short hand between ${hour} and ${hour + 1}, Long hand on 6`
    : `Short hand on ${hour}, Long hand on 12`;
  return {
    question: `What time does this clock show? 🕒 [ ${handDesc} ]`,
    answer: isHalf ? `${hour}:30` : `${hour}:00`,
    topic: 'Time',
    aiGenerated: false
  };
};

const generateGeometry: ConceptGenerator = (v, originalQ = '') => {
  const isAngle = /\b(angle|angles|degree|degrees|protractor|90|acute|obtuse|right)\b/i.test(originalQ);
  if (isAngle) {
    const anglePresets = [
      { q: 'An angle that measures less than 90 degrees is called an ___ angle. (Choose: Right, Acute, or Obtuse)', ans: 'Acute' },
      { q: 'An angle that measures exactly 90 degrees is called a ___ angle. (Choose: Right, Acute, or Obtuse)', ans: 'Right' },
      { q: 'An angle that measures more than 90 degrees but less than 180 degrees is called an ___ angle. (Choose: Right, Acute, or Obtuse)', ans: 'Obtuse' },
      { q: 'An angle that measures exactly 180 degrees is called a ___ angle. (Choose: Straight, Right, or Acute)', ans: 'Straight' },
      { q: 'How many right angles (90 degrees) are in a standard square?', ans: '4' },
    ];
    const ap = anglePresets[v % anglePresets.length];
    return { question: ap.q, answer: ap.ans, topic: 'Geometry (Angles)', aiGenerated: false };
  }

  const shapes = [
    { q: 'How many straight sides does a triangle have?', ans: '3' },
    { q: 'How many corners does a square have?', ans: '4' },
    { q: 'Which shape has 0 straight sides? (Choose: Circle or Square)', ans: 'Circle' },
    { q: 'How many sides does a rectangle have?', ans: '4' },
    { q: 'How many sides does a pentagon have?', ans: '5' },
    { q: 'How many sides does a hexagon have?', ans: '6' },
  ];
  const s = shapes[v % shapes.length];
  return { question: s.q, answer: s.ans, topic: 'Geometry', aiGenerated: false };
};

const generateAlgebra: ConceptGenerator = (v) => {
  const x = (v % 5) + 2;
  const y = (v % 7) + 3;
  return { question: `Solve for x: x + ${y} = ${x + y}`, answer: String(x), topic: 'Algebra', aiGenerated: false };
};

const generateDecimals: ConceptGenerator = (v) => {
  const a = parseFloat(((v % 9) + 1.2).toFixed(1));
  const b = parseFloat(((v % 5) + 0.8).toFixed(1));
  return {
    question: `Add decimals: ${a.toFixed(1)} + ${b.toFixed(1)} = ?`,
    answer: (a + b).toFixed(1),
    topic: 'Decimals',
    aiGenerated: false
  };
};

const generatePercentages: ConceptGenerator = (v) => {
  const part = (v + 1) * 10;
  return {
    question: `What percent of 100 is ${part}?`,
    answer: `${part}%`,
    topic: 'Percentages',
    aiGenerated: false
  };
};

const generateRatios: ConceptGenerator = (v) => {
  const boys = (v % 5) + 2;
  const girls = (v % 4) + 3;
  return {
    question: `In a class of ${boys + girls} students, there are ${boys} boys and ${girls} girls. What is the ratio of boys to girls?`,
    answer: `${boys}:${girls}`,
    topic: 'Ratios',
    aiGenerated: false
  };
};

const generateIntegers: ConceptGenerator = (v) => {
  const a = (v % 10) - 5;
  const b = (v % 8) - 4;
  return {
    question: `Add integers: (${a}) + (${b}) = ?`,
    answer: String(a + b),
    topic: 'Integers',
    aiGenerated: false
  };
};

const generateStatistics: ConceptGenerator = (v) => {
  const scores = [45, 50, 55, 60].map(s => s + v);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {
    question: `Find the mean (average) of these scores: ${scores.join(', ')}`,
    answer: mean.toFixed(1),
    topic: 'Statistics',
    aiGenerated: false
  };
};

const generateProbability: ConceptGenerator = (v) => {
  const favorable = (v % 3) + 1;
  return {
    question: `What is the probability of rolling a ${favorable} on a fair 6-sided die? (Write as a fraction)`,
    answer: `${favorable}/6`,
    topic: 'Probability',
    aiGenerated: false
  };
};

const generateWordProblems: ConceptGenerator = (v) => {
  const pens = (v + 1) * 3;
  const cost = pens * 5;
  return {
    question: `A student buys ${pens} pens at ₹5 each. What is the total cost?`,
    answer: `₹${cost}`,
    topic: 'Word Problems',
    aiGenerated: false
  };
};

const generateOrdinalNumbers: ConceptGenerator = (v) => {
  const positions = ['1st', '2nd', '3rd', '4th', '5th'];
  const animals = ['Cat 🐱', 'Dog 🐶', 'Rabbit 🐰', 'Panda 🐼', 'Fox 🦊'];
  const idx = v % positions.length;
  return {
    question: `In a queue [ 1st Cat 🐱, 2nd Dog 🐶, 3rd Rabbit 🐰, 4th Panda 🐼, 5th Fox 🦊 ], which position is ${animals[idx]} in?`,
    answer: positions[idx],
    topic: 'Ordinal Numbers',
    aiGenerated: false
  };
};

// ─── DYNAMIC POOL & SHUFFLE UTILITIES FOR MATCHING EXERCISES ────────────────
const FRUIT_POOL = [
  'Apple 🍎', 'Banana 🍌', 'Orange 🍊', 'Grapes 🍇', 'Mango 🥭',
  'Pineapple 🍍', 'Strawberry 🍓', 'Watermelon 🍉', 'Pear 🍐', 'Kiwi 🥝',
  'Papaya 🥭', 'Peach 🍑', 'Cherry 🍒', 'Lemon 🍋'
];

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let m = result.length;
  let t: T, i: number;
  let s = Math.abs(Math.sin(seed + 1) * 10000);
  while (m) {
    i = Math.floor((s - Math.floor(s)) * m--);
    s = Math.abs(Math.sin(s + m) * 10000);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
}

export function generateMatchingExercise(
  v: number,
  sourceItems: string[],
  targetPool: string[],
  topicName: string,
  sourceLabel: string = 'item',
  targetLabel: string = 'target'
): BlueprintQuestion {
  const selectedTargets = shuffleWithSeed(targetPool, v * 17 + 5).slice(0, sourceItems.length);
  const options = shuffleWithSeed(selectedTargets, v * 31 + 13);

  const idx = v % sourceItems.length;
  const source = sourceItems[idx];
  const target = selectedTargets[idx];

  return {
    question: `Match the ${source} ${sourceLabel} to the correct ${targetLabel}.`,
    answer: target,
    options,
    answerMode: 'dropdown',
    topic: topicName,
    aiGenerated: false
  };
}

const generateMatchFingersToFruits: ConceptGenerator = (v) => {
  const fingers = ['Thumb', 'Index', 'Middle', 'Ring', 'Little'];
  return generateMatchingExercise(v, fingers, FRUIT_POOL, 'Match Fingers to Fruits', 'finger', 'fruit');
};

function toTallyString(n: number): string {
  const fives = Math.floor(n / 5);
  const rem = n % 5;
  const groups: string[] = [];
  for (let i = 0; i < fives; i++) {
    groups.push('||||/');
  }
  if (rem > 0) {
    groups.push('|'.repeat(rem));
  }
  return groups.join(' ');
}

const generateMatchTheTallies: ConceptGenerator = (v) => {
  const count = (v % 12) + 3; // e.g. 3 to 14
  const tallyStr = toTallyString(count);

  const options = shuffleWithSeed([
    String(count),
    String(count + 2),
    String(Math.max(1, count - 1)),
    String(count + 5),
    String(count + 1)
  ], v * 13 + 3);

  return {
    question: `Count the tally marks (${tallyStr}) and match the correct number:`,
    answer: String(count),
    options,
    answerMode: 'dropdown',
    topic: 'Match the Tallies',
    remediation: 'Count each group of 5 tally marks (||||/) as 5, then add single vertical tally marks (|) to find the total count.',
    aiGenerated: false
  };
};

const generateAddAndMatch: ConceptGenerator = (v) => {
  const num1 = (v + 1) * 4 + 3;
  const num2 = (v + 1) * 3 + 5;
  const sum = num1 + num2;
  const options = shuffleWithSeed([
    sum,
    sum + 2,
    Math.max(1, sum - 3),
    sum + 5,
    sum + 10
  ], v * 19 + 7).map(String);

  return {
    question: `Solve addition and match option: ${num1} + ${num2} = ?`,
    answer: String(sum),
    options,
    answerMode: 'dropdown',
    topic: 'Add and Match',
    remediation: 'Calculate the sum of the two numbers and select the matching option.',
    aiGenerated: false
  };
};

const generateReadWriteDecimals: ConceptGenerator = (v) => {
  const value = (v + 12) / 10; // e.g. 1.2, 1.3, 1.4...
  return {
    question: `Write the decimal number ${value.toFixed(1)} in words.`,
    answer: `${value.toFixed(1)} = "${value.toFixed(1)}"`,
    topic: 'Read & Write Decimals',
    remediation: 'Say the whole number part, then the decimal part digit by digit (e.g., 1.2 = one point two).',
    aiGenerated: false
  };
};


const generateCompareDecimals: ConceptGenerator = (v) => {
  const a = (20 + v) / 10; // e.g. 2.0, 2.1, 2.2...
  const b = a + 0.2;
  const options = shuffleWithSeed([a.toFixed(1), b.toFixed(1)], v * 17 + 5);
  return {
    question: `Which is greater: ${a.toFixed(1)} or ${b.toFixed(1)}?`,
    answer: b.toFixed(1),
    options,
    answerMode: 'dropdown',
    topic: 'Compare Decimals',
    remediation: 'Compare digits from left to right; the larger digit in the first differing place decides.',
    aiGenerated: false
  };
};


const generateDecimalsInMoney: ConceptGenerator = (v) => {
  const cost = 12.50 + v; // e.g. ₹12.50, ₹13.50...
  const paid = 20.00;
  return {
    question: `A toy costs ₹${cost.toFixed(2)}. If you pay ₹${paid.toFixed(2)}, how much change will you get?`,
    answer: `₹${(paid - cost).toFixed(2)}`,
    topic: 'Decimals in Money',
    remediation: 'Subtract the cost from the amount paid, keeping two decimal places for rupees and paise.',
    aiGenerated: false
  };
};
const generateWritePosition: ConceptGenerator = (v) => {
  const items = ['apple', 'banana', 'mango', 'grapes', 'orange'];
  const pos = (v % items.length) + 1; // 1 to 5
  return {
    question: `Write the position of "${items[pos - 1]}" in the list: ${items.join(', ')}`,
    answer: `${items[pos - 1]} is at position ${pos}`,
    topic: 'Write Position',
    remediation: 'Count items from left to right. The first item is position 1, second is 2, and so on.',
    aiGenerated: false
  };
};

const generateIdentifyPosition: ConceptGenerator = (v) => {
  const items = ['dog', 'cat', 'rabbit', 'parrot', 'fish'];
  const pos = (v % items.length) + 1;
  return {
    question: `Which animal is at position ${pos} in the list: ${items.join(', ')}?`,
    answer: items[pos - 1],
    options: shuffleWithSeed(items, v * 11 + 5),
    answerMode: 'dropdown',
    topic: 'Identify Position',
    remediation: 'Look at the list and count carefully to find the item at the given position.',
    aiGenerated: false
  };
};
const generateCountEqualGroups: ConceptGenerator = (v) => {
  const groupSize = (v % 5) + 2;   // 2 to 6
  const groups = (v % 4) + 2;      // 2 to 5
  const total = groupSize * groups;

  return {
    question: `There are ${groups} groups with ${groupSize} objects each. How many objects in total?`,
    answer: String(total),
    topic: 'Count Equal Groups',
    remediation: 'Multiply the number of groups by the size of each group to find the total.',
    aiGenerated: false
  };
};
const generateRepeatedAddition: ConceptGenerator = (v) => {
  const number = (v % 5) + 2;   // 2 to 6
  const times = (v % 4) + 3;    // 3 to 6
  const sum = number * times;

  return {
    question: `Add ${number} repeated ${times} times (e.g., ${Array(times).fill(number).join(' + ')}).`,
    answer: String(sum),
    topic: 'Repeated Addition',
    remediation: 'Repeated addition is multiplication. Add the same number multiple times or multiply directly.',
    aiGenerated: false
  };
};
const generateMultiplicationTable: ConceptGenerator = (v) => {
  const a = (v % 9) + 1;   // 1 to 9
  const b = (v % 9) + 1;   // 1 to 9
  const product = a * b;

  return {
    question: `Fill in the multiplication table: ${a} × ${b} = ?`,
    answer: String(product),
    topic: 'Complete the Multiplication Table',
    remediation: 'Use multiplication facts for 1‑digit numbers to complete the table.',
    aiGenerated: false
  };
};
const generateAdditionObjects: ConceptGenerator = (v, originalQ = '') => {
  const a = (v % 4) + 2;
  const b = (v % 4) + 2;
  const total = a + b;
  const item = /apple|🍎/i.test(originalQ) ? 'apples 🍎' : 'objects';
  return {
    question: `Add using ${item}: ${'🍎'.repeat(a)} + ${'🍎'.repeat(b)} = ?`,
    answer: String(total),
    topic: 'Addition (Objects)',
    remediation: 'Count each group and then add them together.',
    aiGenerated: false
  };
};

const generateNumberSensePlaceValue: ConceptGenerator = (v, originalQ = '') => {
  const num = ((v * 17 + 13) % 80) + 12; // e.g. 13, 30, 47, 64, 81...
  const tens = Math.floor(num / 10);
  const ones = num % 10;

  if (/ten/i.test(originalQ)) {
    return {
      question: `How many tens are in the number ${num}?`,
      answer: String(tens),
      topic: 'Number Sense (Place Value)',
      remediation: 'Divide the number by 10 to find the tens place.',
      aiGenerated: false
    };
  }
  if (/one/i.test(originalQ)) {
    return {
      question: `How many ones are in the number ${num}?`,
      answer: String(ones),
      topic: 'Number Sense (Place Value)',
      remediation: 'Look at the last digit to find the ones place.',
      aiGenerated: false
    };
  }
  return {
    question: `Break down ${num} into tens and ones.`,
    answer: `${tens} tens and ${ones} ones`,
    topic: 'Number Sense (Place Value)',
    remediation: 'Split the number into tens and ones.',
    aiGenerated: false
  };
};


const generateGeometryPerimeter: ConceptGenerator = (v) => {
  const side = (v % 10) + 2;
  return {
    question: `What is the perimeter of a square with side length ${side} cm?`,
    answer: String(side * 4) + ' cm',
    topic: 'Geometry (Perimeter)',
    remediation: 'Perimeter of a square = 4 × side length.',
    aiGenerated: false
  };
};
const generateGeometryAngles: ConceptGenerator = (v) => {
  const presets = [
    { q: 'An angle that measures exactly 90 degrees is called a ___ angle.', ans: 'Right' },
    { q: 'An angle less than 90 degrees is called ___.', ans: 'Acute' },
    { q: 'An angle greater than 90 but less than 180 is called ___.', ans: 'Obtuse' }
  ];
  const p = presets[v % presets.length];
  return { question: p.q, answer: p.ans, topic: 'Geometry (Angles)', aiGenerated: false };
};

const generateSubtractionObjects: ConceptGenerator = (v, originalQ = '') => {
  const total = (v % 8) + 6;   // 6–13 objects
  const remove = (v % 4) + 2;  // 2–5 removed
  const remaining = total - remove;

  let item = 'objects';
  if (/apple|🍎/i.test(originalQ)) item = 'apples 🍎';
  if (/balloon|🎈/i.test(originalQ)) item = 'balloons 🎈';
  if (/star|★/i.test(originalQ)) item = 'stars ★';

  return {
    question: `Subtract using ${item}: ${item} shown = ${total}, remove ${remove}. How many left?`,
    answer: String(remaining),
    topic: 'Subtraction (Objects)',
    remediation: 'Count the total, take away the removed items, and see how many remain.',
    aiGenerated: false
  };
};
const generateHowManyPlaceValue: ConceptGenerator = (v, originalQ = '') => {
  const num = (v % 90) + 10; // 10–99
  const tens = Math.floor(num / 10);
  const ones = num % 10;

  if (/ten/i.test(originalQ)) {
    return {
      question: `How many tens are in the number ${num}?`,
      answer: String(tens),
      topic: 'Number Sense (Place Value)',
      remediation: 'Divide the number by 10 to find the tens place.',
      aiGenerated: false
    };
  }
  if (/one/i.test(originalQ)) {
    return {
      question: `How many ones are in the number ${num}?`,
      answer: String(ones),
      topic: 'Number Sense (Place Value)',
      remediation: 'Look at the last digit to find the ones place.',
      aiGenerated: false
    };
  }
  // fallback
  return {
    question: `Break down ${num} into tens and ones.`,
    answer: `${tens} tens and ${ones} ones`,
    topic: 'Number Sense (Place Value)',
    remediation: 'Split the number into tens and ones.',
    aiGenerated: false
  };
};

const generateNumberSenseComparison: ConceptGenerator = (v, originalQ = '') => {
  const a = ((v * 3 + 1) % 9) + 1;
  let b = ((v * 5 + 4) % 9) + 1;
  if (a === b) b = (b % 9) + 1;

  if (/bigger|greater|smaller|less/i.test(originalQ)) {
    return {
      question: `Which numeral is bigger: ${a} or ${b}?`,
      answer: String(Math.max(a, b)),
      topic: 'Number Sense (Comparison)',
      remediation: 'Compare the digits directly. The larger digit means the bigger numeral.',
      aiGenerated: false
    };
  }
  // fallback
  return {
    question: `Which number is greater: ${a} or ${b}?`,
    answer: String(Math.max(a, b)),
    topic: 'Number Sense (Comparison)',
    remediation: 'Compare the two numbers and choose the larger one.',
    aiGenerated: false
  };
};

const generateNumberSenseCounting: ConceptGenerator = (v, originalQ = '') => {
  // 🔎 Detect context from the original question
  if (/finger|hand|thumb|index|middle|ring|little/i.test(originalQ)) {
    const count = (v % 5) + 1; // 1–5 fingers
    return {
      question: `Count the fingers shown: 🖐️ (${count} fingers). How many?`,
      answer: String(count),
      topic: 'Number Sense (Counting)',
      remediation: 'Count each finger one by one to find the total.',
      aiGenerated: false
    };
  }

  if (/star|★/i.test(originalQ)) {
    const count = (v % 10) + 5; // 5–14 stars
    return {
      question: `Count the stars: ${'★'.repeat(count)}. How many are there?`,
      answer: String(count),
      topic: 'Number Sense (Counting)',
      remediation: 'Count each star one by one to find the total.',
      aiGenerated: false
    };
  }

  if (/apple|🍎/i.test(originalQ)) {
    const count = (v % 6) + 2; // 2–7 apples
    return {
      question: `Count the apples: ${'🍎'.repeat(count)}. How many apples are there?`,
      answer: String(count),
      topic: 'Number Sense (Counting)',
      remediation: 'Count each apple one by one to find the total.',
      aiGenerated: false
    };
  }

  if (/balloon|🎈/i.test(originalQ)) {
    const count = (v % 6) + 3; // 3–8 balloons
    return {
      question: `Count the balloons: ${'🎈'.repeat(count)}. How many balloons are there?`,
      answer: String(count),
      topic: 'Number Sense (Counting)',
      remediation: 'Count each balloon one by one to find the total.',
      aiGenerated: false
    };
  }

  // 🛠️ Fallback for generic "How many objects"
  const count = (v % 5) + 3;
  const symbols = ['🔵', '⭐', '🍎', '🎈', '🌸', '🚗', '🍪', '🐱'][v % 8];
  return {
    question: `Count the items shown: ${symbols.repeat(count)}. How many are there?`,
    answer: String(count),
    topic: 'Number Sense (Counting)',
    remediation: 'Count each item one by one to find the total.',
    aiGenerated: false
  };
};


// ─── GENERATOR REGISTRY ────────────────────────────────────────────────────────
const GENERATORS: Record<string, ConceptGenerator> = {
  'fractions': generateFractions,
  'directions': generateDirections,
  'direction': generateDirections,
  'shortest path': generateShortestPath,
  'shortestpath': generateShortestPath,
  'map interpretation': generateMapInterpretation,
  'mapinterpretation': generateMapInterpretation,
  'map': generateMapInterpretation,
  'common factors': generateCommonFactors,
  'commonfactors': generateCommonFactors,
  'hcf': generateCommonFactors,
  'factors': generateFactors,
  'factor': generateFactors,
  'common multiples': generateCommonMultiples,
  'commonmultiples': generateCommonMultiples,

  'lcm': generateCommonMultiples,
  'multiples': generateMultiples,
  'multiple': generateMultiples,
  'complete the whole': generateCompleteTheWhole,
  'place value': generatePlaceValue,
  'number sense': generateNumberSense,
  'ordering': generateOrdering,
  'comparison': generateComparison,
  'addition': generateAddition,
  'subtraction': generateSubtraction,
  'multiplication': generateMultiplication,
  'number sense (comparison)': generateNumberSenseComparison,
  'division': generateDivision,
  'division (equal sharing)': generateDivisionEqualSharing,
  'equal sharing': generateDivisionEqualSharing,
  'division (equal grouping)': generateDivisionEqualGrouping,
  'equal grouping': generateDivisionEqualGrouping,
  'patterns': generatePatterns,
  'data handling': generateDataHandling,
  'money': generateMoney,
  'measurement': generateMeasurement,
  'unit conversion': generateUnitConversion,
  'time': generateTime,
  'geometry': generateGeometry,
  'algebra': generateAlgebra,
  'decimals': generateDecimals,
  'percentages': generatePercentages,
  'ratios': generateRatios,
  'integers': generateIntegers,
  'statistics': generateStatistics,
  'probability': generateProbability,
  'word problems': generateWordProblems,
  'ordinal numbers': generateOrdinalNumbers,
  'matchfingerstofruits': generateMatchFingersToFruits,
  'match fingers to fruits': generateMatchFingersToFruits,
  'add and match': generateAddAndMatch,
  'addandmatch': generateAddAndMatch,
  'match the tallies': generateMatchTheTallies,
  'matchthetallies': generateMatchTheTallies,
  'tally marks': generateMatchTheTallies,
  'tally': generateMatchTheTallies,
  'read & write decimals': generateReadWriteDecimals,
  'compare decimals': generateCompareDecimals,
  'decimals in money': generateDecimalsInMoney,
  'write position': generateWritePosition,
  'identify position': generateIdentifyPosition,
  'count equal groups': generateCountEqualGroups,
  'repeated addition': generateRepeatedAddition,
  'complete the multiplication table': generateMultiplicationTable,
  'addition (objects)': generateAdditionObjects,
  'subtraction (objects)': generateSubtractionObjects,
  'number sense (place value)': generateNumberSensePlaceValue,
  'number sense (counting)': generateNumberSenseCounting,
  'geometry (perimeter)': generateGeometryPerimeter,
  'geometry (angles)': generateGeometryAngles,
};

/**
 * Dynamically register a new concept generator without editing core engine code.
 */
export function registerConceptGenerator(conceptKey: string, generator: ConceptGenerator): void {
  GENERATORS[conceptKey.toLowerCase()] = generator;
}

// ─── generateByConcept ─────────────────────────────────────────────────────────
/**
 * Dynamic registry lookup per concept.
 * All generators produce 100% human-readable, answerable practice questions.
 * answerMode is attached automatically from getAnswerMode() — no need to set it per return.
 */
export function generateByConcept(
  concept: string,
  variantIndex: number,
  originalQ: string = '',
  originalAnswer: string = ''
): BlueprintQuestion {
  const result = _generateByConcept(concept, variantIndex, originalQ, originalAnswer);
  result.answerMode = getAnswerMode(result.topic);
  if (!result.remediation) {
    result.remediation = getHumanReadableRemediation(result.topic || concept, originalQ);
  }
  return result;
}

/** Internal implementation — uses the GENERATORS registry */
function _generateByConcept(
  concept: string,
  variantIndex: number,
  originalQ: string = '',
  originalAnswer: string = ''
): BlueprintQuestion {
  let c = (concept || '').toLowerCase().trim();

  // Normalize/Map specific FLN worksheet slugs to core concepts
  if (
    c.startsWith('number sense') ||
    c.endsWith('(objects)') ||
    c.startsWith('geometry (')
  ) {
    // Keep exact sub-concept key for dedicated context-aware generator
  } else if (c.includes('ordinal') || c.includes('position')) {
    c = 'ordinal numbers';
  } else if (c.includes('measurement') || c.includes('ruler-measure') || c.includes('measure-objects')) {
    c = 'measurement';
  } else if (c.includes('comparison') || c.includes('compare')) {
    c = 'comparison';
  } else if (c.includes('tally') || c.includes('tallies')) {
    c = 'match the tallies';
  } else if (c.includes('pattern') || c.includes('patterns')) {
    c = 'complete the patterns';
  } else if (c.includes('clock') || c.includes('time')) {
    c = 'read the clock';
  } else if (c.includes('finger') || c.includes('fruit')) {
    c = 'match fingers to fruits';
  } else if (c.includes('add and match')) {
    c = 'add and match';
  } else if (c.includes('decimal')) {
    if (c.includes('compare')) c = 'compare decimals';
    else if (c.includes('money')) c = 'decimals in money';
    else c = 'read & write decimals';
  }

  // ── ADDITION ───────────────────────────────────────────────
  if (c === 'addition') {
    const a = 10 + variantIndex * 2;
    const b = 5 + variantIndex * 3;
    const sum = a + b;

    return {
      question: `Add these numbers: ${a} + ${b}`,
      options: [String(sum), String(sum + 1), String(sum - 1), String(sum + 2)],
      answer: String(sum),
      topic: 'Addition',
      remediation: getHumanReadableRemediation('Addition', originalQ),
      aiGenerated: true
    };
  }

  // ── COMPLETE THE PATTERNS (shape sequences) ────────────────
  if (c === 'complete the patterns' || c.replace(/\s+/g, '') === 'completethepatterns') {
    const sequences = [
      { seq: ['Circle', 'Triangle', 'Circle', 'Triangle'], answer: 'Circle' },
      { seq: ['Square', 'Circle', 'Square', 'Circle'], answer: 'Square' },
      { seq: ['Triangle', 'Square', 'Triangle', 'Square'], answer: 'Triangle' },
      { seq: ['Circle', 'Square', 'Circle', 'Square'], answer: 'Circle' },
      { seq: ['Triangle', 'Circle', 'Triangle', 'Circle'], answer: 'Triangle' }
    ];
    const variant = sequences[variantIndex % sequences.length];

    return {
      question: `Complete the shape pattern sequence: ${variant.seq.join(', ')} , ___`,
      options: Array.from(new Set(variant.seq)),
      answer: variant.answer,
      topic: 'Complete the Patterns',
      remediation: getHumanReadableRemediation('Complete the Patterns', originalQ),
      aiGenerated: true
    };
  }

  // ── READ THE CLOCK ─────────────────────────────────────────
  if (c === 'read the clock' || c.replace(/\s+/g, '') === 'readtheclock') {
    const hours = 3 + variantIndex;
    const minutes = (variantIndex % 2 === 0) ? 0 : 30;
    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;

    return {
      question: `What time does this clock show? 🕒 [ Short hand on ${hours}, Long hand on ${minutes === 0 ? 12 : 6} ]`,
      options: [timeStr, `${hours + 1}:00`],
      answer: timeStr,
      topic: 'Read the Clock',
      remediation: getHumanReadableRemediation('Read the Clock', originalQ),
      aiGenerated: true
    };
  }

  // ── MATCH TIME AND CLOCK ──────────────────────────────────
  if (c === 'match time and clock' || c.replace(/\s+/g, '') === 'matchtimeandclock') {
    const hours = 7 + variantIndex;
    const minutes = (variantIndex % 2 === 0) ? 0 : 30;
    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;

    return {
      question: `Match the time with the correct clock face: ${timeStr}`,
      options: [`Clock showing ${timeStr}`, `Clock showing ${hours + 1}:00`],
      answer: `Clock showing ${timeStr}`,
      topic: 'Match Time and Clock',
      remediation: getHumanReadableRemediation('Match Time and Clock', originalQ),
      aiGenerated: true
    };
  }

  // ── OTHER REGISTERED GENERATORS ───────────────────────────
  if (c === 'matchfingerstofruits' || c.replace(/\s+/g, '') === 'matchfingerstofruits') {
    return generateMatchFingersToFruits(variantIndex, originalQ, originalAnswer);
  }
  if (c === 'add and match' || c.replace(/\s+/g, '') === 'addandmatch') {
    return generateAddAndMatch(variantIndex, originalQ, originalAnswer);
  }
  if (c === 'match the tallies' || c.includes('tally') || c.replace(/\s+/g, '') === 'matchthetallies') {
    return generateMatchTheTallies(variantIndex, originalQ, originalAnswer);
  }

  const gen = GENERATORS[c] || GENERATORS[c.replace(/\s+/g, '')];
  if (gen) return gen(variantIndex, originalQ, originalAnswer);

  // ── DEFAULT FALLBACK ──────────────────────────────────────
  return {
    question: `Practice question for "${concept || 'this topic'}" (auto-generated).`,
    answer: originalAnswer || '',
    topic: concept || 'General',
    remediation: getHumanReadableRemediation(concept, originalQ),
    aiGenerated: true,
    needsReview: true
  };
}

// ─── generateRemediationVariants ──────────────────────────────────────────────
/**
 * Generate `count` endless concept-matched practice questions for one paper question.
 * Concept is auto-detected if not explicitly provided.
 */
export function generateRemediationVariants(
  originalQ: string,
  originalAnswer: string = '',
  count: number = 5,
  hintConcept: string = ''
): BlueprintQuestion[] {
  const cleanQ = sanitizeQuestionText(originalQ);
  const concept = detectConcept(cleanQ, hintConcept);
  console.log("Detected concept:", concept);

  return Array.from({ length: count }, (_, i) => {
    const variant = generateByConcept(concept, i, cleanQ, originalAnswer);

    // Always attach remediation so frontend can display it
    variant.remediation = getHumanReadableRemediation(concept, cleanQ);

    return variant;
  });
}


// ─── BlueprintEngine Class ─────────────────────────────────────────────────────
export class BlueprintEngine {
  /**
   * Scalable Domain-Aware Paper Question Mutator.
   *
   * Priority order:
   *  1. Numeric mutator — paper question has numbers → mutate in-place (preserves full sentence)
   *  2. Concept detection → route to the correct topic generator via generator registry
   *  3. Domain-aware fallback — uses conceptName to pick the right operation
   */
  public generate(
    originalQuestion: string,
    conceptName: string,
    questionType: string = 'standard',
    originalAnswer: string = '',
    variantIndex: number = 0
  ): BlueprintQuestion {

    // ── 1. Clean question text ──────────────────────────────────────────────────
    let cleanQ = (originalQuestion || '')
      .replace(/[\s—–-]*Item\s*\d+/gi, '')
      .replace(/[\s—–-]*Question\s*\d+/gi, '')
      .replace(/^Question\s*\d+\s*:\s*/i, '')
      .trim();

    if (!cleanQ) cleanQ = `${conceptName || 'Mathematics'} Question`;

    // ── 2. Concept Detection + Concept Generator ────────────────────────────────
    // Auto-detect concept from question text, then route to the right generator.
    const concept = detectConcept(cleanQ, conceptName);
    const generated = generateByConcept(concept, variantIndex, cleanQ, originalAnswer);

    // If the generator returned a genuine answer (not a needsReview placeholder), use it
    if (!generated.needsReview) {
      return generated;
    }

    // ── 3. Numeric Mutator ──────────────────────────────────────────────────────
    // If the paper question contains numbers, mutate them in-place to produce
    // a structurally identical question with different values.
    const matches = cleanQ.match(/\d+/g);
    if (matches && matches.length >= 1) {
      const nums = matches.map(Number);
      let mutatedText = cleanQ;
      const mutatedNums: number[] = [];

      for (let i = 0; i < nums.length; i++) {
        const origNum = nums[i];
        const step = (variantIndex + 1) * (i + 1) * (origNum > 50 ? 5 : 2);
        const newNum = Math.max(1, origNum + (variantIndex % 2 === 0 ? step : -Math.min(step - 1, origNum - 1)));
        mutatedNums.push(newNum);
        mutatedText = mutatedText.replace(new RegExp(`\\b${origNum}\\b`), String(newNum));
      }

      let ansStr = '';
      if (mutatedNums.length >= 2) {
        // Detect operation from question + concept
        const ctx = `${cleanQ} ${conceptName}`.toLowerCase();
        if (/subtra|minus|take away|change|paid|left|remaining|difference|fewer|less than|spent/.test(ctx) || cleanQ.includes('-')) {
          ansStr = String(Math.max(...mutatedNums) - Math.min(...mutatedNums));
        } else if (/divis|divide|quotient|sharing|grouping|equal groups|per group/.test(ctx) || cleanQ.includes('÷')) {
          ansStr = String(Math.floor(Math.max(...mutatedNums) / (Math.min(...mutatedNums) || 1)));
        } else if (/multipl|times|product|each costs/.test(ctx) || cleanQ.includes('×')) {
          ansStr = String(mutatedNums.reduce((a, b) => a * b, 1));
        } else {
          ansStr = String(mutatedNums.reduce((a, b) => a + b, 0));
        }
      } else if (mutatedNums.length === 1) {
        const low = cleanQ.toLowerCase();
        ansStr = (low.includes('meter') || low.includes('convert') || low.includes('m ='))
          ? String(mutatedNums[0] * 100)
          : String(mutatedNums[0]);
      }

      return { question: mutatedText, answer: ansStr, topic: conceptName || 'Mathematics', aiGenerated: false };
    }

    // ── 4. Domain-Aware Fallback ────────────────────────────────────────────────
    // We still don't know the concept, but we know the question text.
    // Infer the operation from conceptName so we don't default to addition.
    const ctx2 = `${conceptName} ${cleanQ}`.toLowerCase();
    const v1 = (variantIndex + 1) * 7 + 12;
    const v2 = (variantIndex + 1) * 4 + 8;

    let fallbackQ: string;
    let fallbackAns: string;

    if (/subtra|minus|difference|take away|fewer|left|remaining|spent/.test(ctx2)) {
      fallbackQ = `Find the difference: ${v1 + 20} - ${v2} = ?`;
      fallbackAns = String(v1 + 20 - v2);
    } else if (/divis|divide|quotient|sharing|grouping/.test(ctx2)) {
      const dvd = v1 * v2;
      fallbackQ = `Solve division: ${dvd} ÷ ${v2} = ?`;
      fallbackAns = String(v1);
    } else if (/multipl|times|product/.test(ctx2)) {
      fallbackQ = `Solve multiplication: ${v1} × ${v2} = ?`;
      fallbackAns = String(v1 * v2);
    } else if (cleanQ && cleanQ !== `${conceptName || 'Mathematics'} Question`) {
      // Tie fallback to the original question text so it's never fully unrelated
      fallbackQ = `Based on the concept in: "${cleanQ}" — solve: ${v1} + ${v2} = ?`;
      fallbackAns = String(v1 + v2);
    } else {
      return {
        question: `Practice question for "${conceptName || 'this topic'}" — the original question text wasn't found.`,
        answer: originalAnswer || '',
        topic: conceptName || 'General',
        aiGenerated: false,
        needsReview: true
      };
    }

    return {
      question: fallbackQ,
      answer: fallbackAns,
      topic: conceptName || concept || 'Mathematics',
      aiGenerated: false,
      needsReview: true
    };
  }
}

export const blueprintEngine = new BlueprintEngine();

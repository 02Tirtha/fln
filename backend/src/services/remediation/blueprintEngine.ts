import conceptMap from './conceptDictionary.json';

export interface BlueprintQuestion {
  question: string;
  answer: string;
  topic: string;
  aiGenerated: boolean;
  needsReview?: boolean;
  answerMode?: 'text' | 'dropdown';
}

// ─── Concept Dictionary ────────────────────────────────────────────────────────
// Loaded from conceptDictionary.json — add new concepts there, not here.
const CONCEPT_MAP: Record<string, string[]> = conceptMap as Record<string, string[]>;

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
    .replace(/\(.*?\)/g, '')
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
 * Auto-detect concept from any question text using the external concept dictionary.
 * Priority order:
 *  1. Keyword detection from question text (overrides stale/incorrect scanner hints)
 *  2. Caller's hintConcept fallback
 *  3. Default to 'General'
 */
export function detectConcept(questionText: string, hintConcept: string = ''): string {
  const normQ = normalizeQuestionText(questionText);
  const q = normQ.toLowerCase();

  // 1. Keyword detection first (overrides bad/stale scanner hints)
  for (const concept in CONCEPT_MAP) {
    for (const keyword of CONCEPT_MAP[concept]) {
      if (q.includes(keyword.toLowerCase())) {
        return concept;
      }
    }
  }

  // 2. Respect hintConcept only if no keyword match
  if (hintConcept) {
    const hintLow = hintConcept.toLowerCase();
    for (const concept in CONCEPT_MAP) {
      if (concept.toLowerCase() === hintLow) {
        return concept;
      }
    }
    return hintConcept; // fallback to caller's hint
  }

  // 3. Default
  return 'General';
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

const generateOrdering: ConceptGenerator = (v) => {
  const base = (v + 1) * 6 + 12;
  const raw = [base + 22, base + 4, base + 15, base + 31];
  const isAsc = v % 2 === 0;
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

const generateAddition: ConceptGenerator = (v) => {
  const a = (v + 1) * 7 + 18;
  const b = (v + 1) * 5 + 14;
  return { question: `Solve addition: ${a} + ${b} = ?`, answer: String(a + b), topic: 'Addition', aiGenerated: false };
};

const generateSubtraction: ConceptGenerator = (v) => {
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

const generatePatterns: ConceptGenerator = (v) => {
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
  const apples = (v + 1) * 3;
  const oranges = (v + 1) * 2;
  return {
    question: `A pictograph shows ${apples} apples and ${oranges} oranges. How many more apples than oranges?`,
    answer: String(apples - oranges),
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

const generateGeometry: ConceptGenerator = (v) => {
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
  return result;
}

/** Internal implementation — uses the GENERATORS registry */
function _generateByConcept(
  concept: string,
  variantIndex: number,
  originalQ: string = '',
  originalAnswer: string = ''
): BlueprintQuestion {
  const c = (concept || '').toLowerCase();
  const gen = GENERATORS[c];

  if (gen) {
    return gen(variantIndex, originalQ, originalAnswer);
  }

  // ── DEFAULT: unknown concept fallback ───────────────────────────────────────
  if (originalQ && originalQ !== concept) {
    return {
      question: originalQ,
      answer: originalAnswer || '',
      topic: concept || 'General',
      aiGenerated: false,
      needsReview: true
    };
  }

  return {
    question: `Practice question for "${concept || 'this topic'}" — the original question text wasn't found.`,
    answer: originalAnswer || '',
    topic: concept || 'General',
    aiGenerated: false,
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

  return Array.from({ length: count }, (_, i) =>
    generateByConcept(concept, i, originalQ, originalAnswer)
  );
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

    // ── 2. Numeric Mutator ──────────────────────────────────────────────────────
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

    // ── 3. Concept Detection + Concept Generator ────────────────────────────────
    // Auto-detect concept from question text, then route to the right generator.
    const concept = detectConcept(cleanQ, conceptName);
    const generated = generateByConcept(concept, variantIndex, cleanQ, originalAnswer);

    // If the generator returned a genuine answer (not a needsReview placeholder), use it
    if (!generated.needsReview) {
      return generated;
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

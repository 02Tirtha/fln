import { processPaper, buildConceptDictionary } from './src/services/remediation/paperBatchProcessor';

const reviewAssessmentPapers = [
  {
    paperId: 'RA-LEVEL-11',
    paperName: 'Level 11: Review Assessment 1 (Levels 1-10)',
    questions: [
      'Compare groups: Fill comparison grid symbol for 8 vs 5',
      'Odd One Out: Identify the item that does not belong in stationery',
      'Match shape objects: circle, square, triangle, rectangle',
      'Count hand match table: Count fingers shown on hand',
      'Complete sequence blanks: 2, 4, 6, _, 10',
      'Add and subtract match: 5 + 3 = ? and 8 - 2 = ?',
      'Complete shape pattern: circle, square, circle, square, _'
    ]
  },
  {
    paperId: 'RA-LEVEL-23',
    paperName: 'Level 23: Review Assessment 2 (Levels 12-22)',
    questions: [
      'Tens and ones mixed: Write 2 tens and 5 ones as a number',
      'Sequential number grid fill: Fill numbers from 1 to 50',
      'Count match boxed: Count objects and match matching box',
      'Add and subtract mixed: 12 + 15 = ? and 28 - 14 = ?',
      'Ascending and descending order: Arrange 14, 8, 35, 22 in order',
      'Skip count arrows: Skip count by 2s: 2, 4, 6, 8, _',
      'Numeral comparison: Insert greater than or less than symbol for 34 vs 43'
    ]
  },
  {
    paperId: 'RA-LEVEL-35',
    paperName: 'Level 35: Review Assessment 3 (Levels 24-34)',
    questions: [
      'Tens and units table: Write 68 in tens and units form',
      'Carry addition: 57 + 28 = ? (vertical boxed grid)',
      'Borrow subtraction: 74 - 39 = ? (vertical boxed grid)',
      'Count equal groups: 4 groups of 3 apples (repeated addition)',
      'Match the Tallies — Item 4',
      'Read the clock: What time is shown when short hand points to 7 and long hand to 12?',
      'Ordinal positions: Identify the 3rd student in queue',
      'Ruler measure objects: Measure length of pencil in centimeters'
    ]
  },
  {
    paperId: 'RA-LEVEL-48',
    paperName: 'Level 48: Foundation Mastery Assessment (Levels 36-47)',
    questions: [
      '3-Digit Place Value: Write 4 Hundreds, 5 Tens, and 2 Ones in expanded form',
      'Unit conversion: Convert 4 meters to centimeters',
      'Fractions: What fraction is shaded when 3 out of 4 parts are shaded?',
      'Decimals: Write 0.45 as a decimal fraction',
      'Percentages: Calculate 25% of 200',
      'Geometry: Count the number of sides and vertices of a hexagon',
      'Directions & Map: Identify North, South, East, and West directions on a map'
    ]
  },
  {
    paperId: 'RA-LEVEL-59',
    paperName: 'Level 59: Final FLN Comprehensive Mastery Assessment (Levels 49-58)',
    questions: [
      'Algebra: Solve for x: 4x + 6 = 26',
      'Common Factors: Find the highest common factor (hcf) of 24 and 36',
      'Common Multiples: Find the lowest common multiple (lcm) of 6 and 8',
      'Integers: Calculate negative integer expression: -8 + 15',
      'Ratios: Write the simplified ratio of 10 boys to 15 girls',
      'Statistics: Find the mean average of numbers 10, 20, 30, 40',
      'Probability: What is the probability of flipping heads on a coin toss?'
    ]
  }
];

const dictionary = buildConceptDictionary(reviewAssessmentPapers);

reviewAssessmentPapers.forEach((paperInput) => {
  const paperOutput = processPaper(paperInput, 5, dictionary);
  console.log(`\n================================================================================`);
  console.log(` 📋 ASSESSMENT: ${paperOutput.paperName.toUpperCase()}`);
  console.log(`================================================================================`);

  paperOutput.topics.forEach((topic, idx) => {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`QUESTION #${idx + 1}: ${topic.originalQuestion}`);
    console.log(`CONCEPT: ${topic.concept}`);
    console.log(`REMEDIATION: ${topic.remediation}`);
    console.log(`PRACTICE QUESTIONS (5 VARIANTS):`);

    topic.practiceQuestions.forEach((pq, qIdx) => {
      console.log(`  ${qIdx + 1}. ${pq.question}`);
      if (pq.options && pq.options.length > 0) {
        console.log(`     Options: [${pq.options.join(', ')}]`);
      }
      console.log(`     Answer: ${pq.answer} ${pq.answerMode ? `(Mode: ${pq.answerMode})` : ''}`);
    });
  });
});

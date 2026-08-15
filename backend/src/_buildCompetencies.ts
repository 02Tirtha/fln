/**
 * Normalized FLN competency list. Extracted from the FLN Levels Structure
 * markdown files in `C:\FLN2\fln\FLN Levels Structure\` and from the level
 * names in `FLN_LEVELS_LIST` (backend/src/db.ts). One entry per distinct
 * competency name; the `levels` array records every FLN level where it
 * appears.
 *
 * The graph module (competencyGraph.ts) reads this list to build its
 * `COMPETENCY_GRAPH`. The graph stores the list of levels on each
 * `CompetencyNode`.
 */
const RAW_DATA = `L1|Quantity  Comparison|Comparing Quantities||Equal, More and Less||Visual Comparison
L2|Odd One Out|Odd One Out||Classification and Differentiation||Similarities and Differences
L3|Matching + Tracing Lines|Matching and Association||Shape Recognition||Opposite Concepts||3D Shapes||Object Relationships
L4|Numbers 1-10|Number Recognition (1-10)||Number Tracing||Counting||Number Names
L5|Finger Gesture Counting|Finger Counting||One-to-One Correspondence||Number Recognition||Visual-Quantity Association
L6|After, Between, Before|Number Sequence||Before Numbers||After Numbers||Between Numbers
L7|Addition through objects|Combining Groups||Object-Based Addition||Numerical Addition||Addition within 10
L8|Subtraction(1-10)|Taking Away Objects||Object-Based Subtraction||Numerical Subtraction||Subtraction within 10
L9|Pattern Recognition+Draw by Tracing|Visual Patterns||Number Patterns||Pattern Completion||Sequencing
L10|Comparison - Numeral|Greater Than||Less Than||Equal To||Numeral Comparison
L11|Review Assessment|Comparison||Matching||Counting||Patterns||Number Sequencing
L12|Tens and Ones|Tens||Ones||Place Value||Grouping||Number Representation
L13|Numbers 11-30|Number Recognition (11-30)||Counting||Number Tracing||Number Names
L14|Counting + Fun Trace|Matching Quantities to Numerals||Counting||Tracing||Fine Motor Skills
L15|After, Between & Before|Before Numbers||After Numbers||Between Numbers||Number Sequencing
L16|Addition Through Objects & Numbers 1-30|Addition without Carrying||Object-Based Addition||Numerical Addition||Numbers up to 30
L17|Subtraction Through Objects & Numbers 1-30|Subtraction without Borrowing||Object-Based Subtraction||Numerical Subtraction||Numbers up to 30
L18|Ordering|Ascending Order||Descending Order||Number Sequencing
L19|Numbering 31-50|Number Recognition (31-50)||Number Writing||Number Sequencing||Number Names
L20|Skip Counting in 2s/3s|Skip Counting by 2s||Skip Counting by 3s||Number Patterns||Number Sequences
L21|Comparison (1-50)|Greater Than||Less Than||Equal To||Comparison Symbols (>, <, =)||Number Comparison (1-50)
L22|Ordering (1-50)|Ascending Order||Descending Order||Smallest and Largest Numbers||Number Sequencing (1-50)
L23|Review Assessment|
L24|Numbers 51-100|Number Recognition (51-100)||Missing Numbers
L25|Place Value (Tens & Ones)|Tens||Ones||Place Value||Regrouping Tens and Ones
L26|Carry Addition|Place Value||Carry Addition||Regrouping Tens and Ones
L27|Borrow Subtraction|Place Value||Borrow Subtraction||Regrouping Tens and Ones
L28|Comparison (Greater Than, Less Than, Equal To)|Greater Than (>)||Less Than (<)||Equal To (=)
L29|Ordering (Ascending & Descending)|Ascending Order||Descending Order||Smallest Number
L30|Data Handling (Tally Marks)|Counting Objects||Tally Marks
L31|Time|Full Hours||Half Hours||Quarter Hours
L32|Ordinal Positions (1st-10th)|1st-10th Positions||Identifying Position||Writing Position
L33|Multiplication (Repeated Addition)|Equal Groups||Repeated Addition||Multiplication Sentences
L34|Measurement (Non-Standard & Standard)|Length||Weight||Capacity
L35|Review Assessment|Place Value (Tens & Ones)||Numbers 51-100||Carry Addition
L36|Numbers 101-1000 (Place Value)|Numbers 101-1000||Hundreds||Tens
L37|Comparison (Greater Than, Less Than, Equal To)|Greater Than (>)||Less Than (<)||Equal To (=)
L38|Ordering (Ascending & Descending)|Ascending Order||Descending Order||Place Value
L39|Addition (Up to 1000)|Addition without Regrouping||Addition with Regrouping||Vertical Addition
L40|Subtraction (Up to 1000)|Subtraction without Regrouping||Subtraction with Regrouping||Vertical Subtraction
L41|Multiplication (Tables 2-10)|Multiplication Tables (2-10)||Vertical Multiplication||Two-Digit x One-Digit Multiplication
L42|Division (Introduction)|Equal Sharing||Equal Grouping||Division Facts
L43|Standard Measurement & Simple Conversions|Length (cm, m)||Weight (g, kg)||Capacity (mL, L)
L44|Time & Calendar|Analog Clock||Hours & Minutes||Quarter Past
L45|Fractions|Whole||Equal Parts||Half
L46|Money|Indian Coins||Indian Currency Notes||Counting Money
L47|Data Handling|Tally Marks||Frequency Tables||Pictographs
L48|Foundation Mastery Assessment (Review Assessment)|Numbers up to 1000||Place Value||Comparison
L49|Numbers up to 10,000|Numbers 1,001-10,000||Thousands, Hundreds, Tens & Ones||Place Value
L50|Advanced Multiplication|Two-Digit x Two-Digit Multiplication||Three-Digit x One-Digit Multiplication||Vertical Multiplication
L51|Advanced Division|Long Division||Two-Digit ├╖ One-Digit||Three-Digit ├╖ One-Digit
L52|Maps & Directions|North, South, East, West||Position||Landmarks
L53|Factors & Multiples|Factors||Multiples||Factor Pairs
L54|Fraction Operations|Addition of Like Fractions||Subtraction of Like Fractions||Visual Fraction Models
L55|Decimals (Introduction)|Decimal Numbers||Tenths||Hundredths
L56|Area & Perimeter|Area||Perimeter||Square Units
L57|Angles|Angle||Acute Angle||Right Angle
L58|Symmetry & Reflection|Symmetry||Line of Symmetry||Reflection
L59|Advanced Mastery Assessment|`;

/**
 * Build the normalized competency list: a Map<competencyId, levelLabel[]>.
 * Each level is recorded as "L<n>" (e.g. "L4", "L37"). A competency name
 * that appears at multiple levels is recorded once with all its levels.
 */
export function getCompetencyLevels(): Map<string, string[]> {
  const out = new Map<string, string[]>();

  for (const line of RAW_DATA.split('\n')) {
    if (line.length === 0) continue;
    const [levelPart, levelName, ...topicParts] = line.split('|');
    const levelNum = parseInt(levelPart.replace(/^L/, ''), 10);
    if (Number.isNaN(levelNum)) continue;
    const levelLabel = `L${levelNum}`;

    const candidates: string[] = [];
    if (levelName && levelName.trim().length > 0) {
      candidates.push(levelName.trim());
    }
    for (const topic of topicParts) {
      const trimmed = topic.trim();
      if (trimmed.length > 0) candidates.push(trimmed);
    }

    for (const cand of candidates) {
      const existing = out.get(cand);
      if (existing) {
        if (!existing.includes(levelLabel)) existing.push(levelLabel);
      } else {
        out.set(cand, [levelLabel]);
      }
    }
  }

  return out;
}

/**
 * Manual prerequisite relationships between FLN competencies.
 *
 * Every entry references a competency id that should exist in
 * `competencyGraph.ts`. Some entries may reference competencies that are
 * not in the graph because the FLN curriculum does not categorize every
 * concept as a discrete competency. The validation treats these as WARNINGS,
 * not errors. Invalid references are silently skipped during traversal.
 *
 * The FLN curriculum does not contain an explicit prerequisite section in
 * any markdown file, so this dependency file is a separate, manually
 * authored map of the implicit curriculum progression.
 */

export const COMPETENCY_DEPENDENCIES: Record<string, readonly string[]> = {
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Number Sense strand ΓÇö counting and number recognition
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Counting': [],
  'Number Recognition': [],
  'Comparing Quantities': ['Counting'],
  'Number Recognition (1-10)': ['Counting', 'Number Recognition'],
  'Number Tracing': ['Counting', 'Number Recognition'],
  'Number Names': ['Counting', 'Number Recognition'],
  'Number Sequence': ['Counting', 'Number Recognition'],
  'Visual-Quantity Association': ['Counting'],
  'Matching Quantities to Numerals': ['Counting', 'Visual-Quantity Association'],
  'Counting Objects': ['Counting'],
  'Number Recognition (11-30)': ['Number Recognition (1-10)', 'Counting'],
  'Number Recognition (31-50)': ['Number Recognition (11-30)', 'Counting'],
  'Number Recognition (51-100)': ['Number Recognition (31-50)', 'Counting'],
  'Missing Numbers': ['Counting', 'Number Recognition (51-100)'],
  'Number Writing': ['Number Recognition', 'Counting'],
  'Place Value': ['Counting'],
  'Place Value (Tens & Ones)': ['Place Value', 'Counting', 'Tens', 'Ones'],
  'Tens': ['Counting'],
  'Ones': ['Counting'],
  'Grouping': ['Counting'],
  'Number Representation': ['Number Recognition'],
  'Regrouping Tens and Ones': ['Place Value', 'Tens', 'Ones'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Comparison and ordering
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Greater Than': ['Counting', 'Comparing Quantities'],
  'Less Than': ['Counting', 'Comparing Quantities'],
  'Equal To': ['Counting', 'Comparing Quantities'],
  'Numeral Comparison': ['Greater Than', 'Less Than', 'Equal To'],
  'Comparison Symbols (>, <, =)': ['Greater Than', 'Less Than', 'Equal To'],
  'Comparison': ['Counting'],
  'Comparison (Greater Than, Less Than, Equal To)': ['Greater Than', 'Less Than', 'Equal To'],
  'Comparison (1-50)': ['Comparison (Greater Than, Less Than, Equal To)', 'Number Recognition (31-50)'],
  'Comparison - Numeral': ['Comparison (Greater Than, Less Than, Equal To)'],
  'Ascending Order': ['Counting', 'Comparison'],
  'Descending Order': ['Counting', 'Comparison'],
  'Smallest and Largest Numbers': ['Ascending Order', 'Descending Order'],
  'Smallest Number': ['Ascending Order', 'Descending Order'],
  'Number Sequencing': ['Ascending Order', 'Descending Order', 'Counting'],
  'Number Sequencing (1-50)': ['Number Sequencing', 'Ascending Order', 'Descending Order'],
  'Ordering': ['Ascending Order', 'Descending Order'],
  'Ordering (1-50)': ['Ascending Order', 'Descending Order', 'Comparison (1-50)'],
  'Ordering (Ascending & Descending)': ['Ascending Order', 'Descending Order'],
  'Before Numbers': ['Counting', 'Number Sequence'],
  'After Numbers': ['Counting', 'Number Sequence'],
  'Between Numbers': ['Before Numbers', 'After Numbers'],
  'Patterns': ['Pattern Recognition+Draw by Tracing'],
  'Pattern Recognition+Draw by Tracing': ['Counting'],
  'Visual Patterns': ['Pattern Recognition+Draw by Tracing', 'Counting'],
  'Number Patterns': ['Pattern Recognition+Draw by Tracing', 'Counting'],
  'Pattern Completion': ['Visual Patterns', 'Number Patterns'],
  'Sequencing': ['Counting', 'Pattern Recognition+Draw by Tracing'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Number Operations ΓÇö addition, subtraction, multiplication, division
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Combining Groups': ['Counting'],
  'Object-Based Addition': ['Combining Groups', 'Counting'],
  'Numerical Addition': ['Object-Based Addition', 'Counting'],
  'Addition within 10': ['Numerical Addition', 'Counting'],
  'Addition through objects': ['Counting', 'Object-Based Addition'],
  'Taking Away Objects': ['Counting'],
  'Object-Based Subtraction': ['Taking Away Objects', 'Counting'],
  'Numerical Subtraction': ['Object-Based Subtraction', 'Counting'],
  'Subtraction within 10': ['Numerical Subtraction', 'Counting'],
  'Subtraction(1-10)': ['Counting', 'Object-Based Subtraction'],
  'Addition without Carrying': ['Place Value', 'Numerical Addition'],
  'Addition Through Objects & Numbers 1-30': ['Addition through objects', 'Counting'],
  'Subtraction without Borrowing': ['Place Value', 'Numerical Subtraction'],
  'Subtraction Through Objects & Numbers 1-30': ['Subtraction(1-10)', 'Place Value', 'Addition Through Objects & Numbers 1-30'],
  'Carry Addition': ['Place Value', 'Addition without Carrying', 'Addition Through Objects & Numbers 1-30'],
  'Borrow Subtraction': ['Place Value', 'Subtraction without Borrowing', 'Subtraction Through Objects & Numbers 1-30'],
  'Numbers up to 30': ['Place Value', 'Counting'],
  'Equal Groups': ['Counting'],
  'Repeated Addition': ['Equal Groups', 'Counting'],
  'Multiplication Sentences': ['Equal Groups', 'Repeated Addition'],
  'Multiplication (Repeated Addition)': ['Equal Groups', 'Repeated Addition', 'Place Value', 'Counting'],
  'Multiplication Tables (2-10)': ['Multiplication (Repeated Addition)', 'Counting'],
  'Vertical Multiplication': ['Multiplication Tables (2-10)'],
  'Two-Digit x One-Digit Multiplication': ['Multiplication Tables (2-10)', 'Vertical Multiplication'],
  'Multiplication (Tables 2-10)': ['Multiplication Tables (2-10)', 'Place Value'],
  'Equal Sharing': ['Counting'],
  'Equal Grouping': ['Counting', 'Equal Sharing'],
  'Division Facts': ['Equal Sharing', 'Equal Grouping'],
  'Division (Introduction)': ['Equal Sharing', 'Division Facts', 'Counting'],
  'Two-Digit ├╖ One-Digit': ['Division Facts'],
  'Three-Digit ├╖ One-Digit': ['Division Facts', 'Two-Digit ├╖ One-Digit'],
  'Long Division': ['Division Facts'],
  'Advanced Division': ['Long Division', 'Two-Digit ├╖ One-Digit', 'Three-Digit ├╖ One-Digit'],
  'Advanced Multiplication': ['Multiplication Tables (2-10)', 'Place Value'],
  'Two-Digit x Two-Digit Multiplication': ['Multiplication Tables (2-10)', 'Place Value'],
  'Three-Digit x One-Digit Multiplication': ['Multiplication Tables (2-10)', 'Place Value'],
  'Numbers up to 1000': ['Place Value', 'Counting'],
  'Numbers 101-1000 (Place Value)': ['Place Value (Tens & Ones)', 'Counting', 'Place Value'],
  'Numbers 1,001-10,000': ['Numbers 101-1000 (Place Value)', 'Place Value'],
  'Numbers up to 10,000': ['Numbers 1,001-10,000', 'Place Value'],
  'Thousands, Hundreds, Tens & Ones': ['Place Value'],
  'Hundreds': ['Place Value'],
  'Numbers 51-100': ['Place Value', 'Counting'],
  'Tens and Ones': ['Place Value', 'Counting'],
  'Addition without Regrouping': ['Place Value (Tens & Ones)', 'Carry Addition', 'Numbers 51-100'],
  'Addition with Regrouping': ['Place Value (Tens & Ones)', 'Carry Addition', 'Numbers 51-100'],
  'Vertical Addition': ['Addition without Regrouping', 'Addition with Regrouping', 'Place Value (Tens & Ones)'],
  'Addition (Up to 1000)': ['Place Value (Tens & Ones)', 'Carry Addition', 'Numbers 51-100', 'Addition without Regrouping', 'Addition with Regrouping'],
  'Vertical Subtraction': ['Subtraction without Regrouping', 'Subtraction with Regrouping', 'Place Value (Tens & Ones)'],
  'Subtraction without Regrouping': ['Place Value (Tens & Ones)', 'Borrow Subtraction', 'Numbers 51-100'],
  'Subtraction with Regrouping': ['Place Value (Tens & Ones)', 'Borrow Subtraction', 'Numbers 51-100'],
  'Subtraction (Up to 1000)': ['Place Value (Tens & Ones)', 'Borrow Subtraction', 'Numbers 51-100', 'Subtraction without Regrouping', 'Subtraction with Regrouping'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Fractions
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Whole': ['Counting'],
  'Equal Parts': ['Whole', 'Counting'],
  'Half': ['Equal Parts', 'Counting', 'Whole'],
  'Visual Fraction Models': ['Half', 'Whole', 'Equal Parts'],
  'Fractions': ['Whole', 'Equal Parts', 'Half', 'Counting', 'Comparing Quantities'],
  'Fraction Operations': ['Fractions', 'Visual Fraction Models', 'Half'],
  'Addition of Like Fractions': ['Fractions', 'Fraction Operations'],
  'Subtraction of Like Fractions': ['Fractions', 'Fraction Operations'],
  'Decimals (Introduction)': ['Place Value', 'Fractions', 'Tenths', 'Hundredths'],
  'Tenths': ['Fractions', 'Place Value'],
  'Hundredths': ['Tenths', 'Place Value'],
  'Decimal Numbers': ['Tenths', 'Hundredths', 'Place Value'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Money
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Indian Coins': ['Counting', 'Number Recognition'],
  'Indian Currency Notes': ['Counting', 'Number Recognition'],
  'Counting Money': ['Indian Coins', 'Indian Currency Notes', 'Counting'],
  'Money': ['Indian Coins', 'Indian Currency Notes', 'Number Recognition', 'Counting Money'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Time
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Full Hours': ['Counting'],
  'Half Hours': ['Full Hours', 'Counting'],
  'Quarter Hours': ['Full Hours', 'Half Hours', 'Counting'],
  'Hours & Minutes': ['Full Hours', 'Half Hours', 'Quarter Hours'],
  'Analog Clock': ['Counting', 'Full Hours'],
  'Quarter Past': ['Analog Clock', 'Full Hours', 'Half Hours'],
  'Time': ['Full Hours', 'Half Hours', 'Quarter Hours', 'Counting'],
  'Time & Calendar': ['Time', 'Analog Clock', 'Counting'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Measurement
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Length': ['Counting'],
  'Weight': ['Counting', 'Comparison'],
  'Capacity': ['Counting', 'Comparison'],
  'Measurement (Non-Standard & Standard)': ['Length', 'Weight', 'Capacity', 'Counting', 'Comparison'],
  'Length (cm, m)': ['Measurement (Non-Standard & Standard)', 'Counting'],
  'Weight (g, kg)': ['Measurement (Non-Standard & Standard)', 'Counting'],
  'Capacity (mL, L)': ['Measurement (Non-Standard & Standard)', 'Counting'],
  'Standard Measurement & Simple Conversions': ['Measurement (Non-Standard & Standard)', 'Counting', 'Place Value'],
  'Area': ['Multiplication (Repeated Addition)', 'Standard Measurement & Simple Conversions'],
  'Perimeter': ['Addition (Up to 1000)', 'Standard Measurement & Simple Conversions'],
  'Square Units': ['Area', 'Standard Measurement & Simple Conversions'],
  'Area & Perimeter': ['Area', 'Perimeter', 'Square Units', 'Standard Measurement & Simple Conversions'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Data Handling
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Tally Marks': ['Counting', 'Counting Objects'],
  'Frequency Tables': ['Counting', 'Tally Marks'],
  'Pictographs': ['Counting', 'Tally Marks'],
  'Data Handling (Tally Marks)': ['Tally Marks', 'Counting Objects'],
  'Data Handling': ['Data Handling (Tally Marks)', 'Counting Objects'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Shapes
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Shape Recognition': ['Counting', 'Comparison'],
  'Opposite Concepts': ['Counting', 'Shape Recognition'],
  'Object Relationships': ['Counting', 'Shape Recognition'],
  'Matching and Association': ['Counting', 'Shape Recognition'],
  'Symmetry': ['Shape Recognition', 'Counting'],
  'Line of Symmetry': ['Symmetry'],
  'Reflection': ['Symmetry', 'Line of Symmetry'],
  'Symmetry & Reflection': ['Symmetry', 'Line of Symmetry', 'Reflection'],
  'Angle': ['Shape Recognition', 'Counting'],
  'Acute Angle': ['Angle'],
  'Right Angle': ['Angle'],
  'Angles': ['Angle', 'Acute Angle', 'Right Angle'],
  'North, South, East, West': [],
  'Position': ['North, South, East, West'],
  'Landmarks': ['North, South, East, West', 'Position'],
  'Maps & Directions': ['Position', 'North, South, East, West', 'Landmarks', 'Counting'],
  'Matching': ['Counting', 'Shape Recognition'],
  'Matching + Tracing Lines': ['Counting', 'Shape Recognition'],
  'Counting + Fun Trace': ['Counting', 'Tracing'],
  'Tracing': ['Counting'],
  'Fine Motor Skills': ['Counting', 'Tracing'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Review / consolidation levels
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Review Assessment': ['Counting', 'Comparison', 'Matching', 'Patterns', 'Number Sequencing'],
  'Foundation Mastery Assessment (Review Assessment)': ['Numbers up to 1000', 'Place Value', 'Comparison'],
  'Advanced Mastery Assessment': ['Foundation Mastery Assessment (Review Assessment)', 'Counting', 'Comparison', 'Place Value'],

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Patterns & advanced
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  'Factors & Multiples': ['Multiplication (Tables 2-10)', 'Counting'],
  'Factors': ['Factors & Multiples', 'Multiplication (Tables 2-10)'],
  'Multiples': ['Factors & Multiples', 'Multiplication (Tables 2-10)'],
  'Factor Pairs': ['Factors', 'Multiples'],
};

// ----------------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------------

import { COMPETENCY_GRAPH } from './competencyGraph';

export interface DependencyValidationReport {
  totalKeys: number;
  totalEdges: number;
  warnings: string[];
  circularDependencies: string[][];
  isValid: boolean;
}

export function validateDependencies(): DependencyValidationReport {
  const known = new Set(Object.keys(COMPETENCY_GRAPH));

  const warnings: string[] = [];
  let totalEdges = 0;

  // Check that keys exist in the graph (warning only)
  for (const key of Object.keys(COMPETENCY_DEPENDENCIES)) {
    if (!known.has(key)) {
      warnings.push(`orphan entry: "${key}" not Found in competencyGraph`);
    }
  }

  // Check that values reference graph nodes (warning only)
  for (const [key, deps] of Object.entries(COMPETENCY_DEPENDENCIES)) {
    for (const d of deps) {
      totalEdges++;
      if (!known.has(d)) {
        warnings.push(`missing reference: "${key}" -> "${d}" not in competencyGraph`);
      }
    }
  }

  // Circular dependency detection (error condition)
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  function dfs(nodeId: string): void {
    if (onStack.has(nodeId)) {
      const idx = stack.indexOf(nodeId);
      cycles.push(stack.slice(idx).concat(nodeId));
      return;
    }
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    onStack.add(nodeId);
    stack.push(nodeId);
    for (const dep of COMPETENCY_DEPENDENCIES[nodeId] ?? []) {
      if (known.has(dep)) dfs(dep);
    }
    stack.pop();
    onStack.delete(nodeId);
  }
  for (const key of Object.keys(COMPETENCY_DEPENDENCIES)) {
    if (known.has(key)) dfs(key);
  }

  return {
    totalKeys: Object.keys(COMPETENCY_DEPENDENCIES).length,
    totalEdges,
    warnings,
    circularDependencies: cycles,
    isValid: cycles.length === 0,
  };
}

/**
 * Resolve the prerequisites for a competency, returning only those that
 * exist in the graph (skipping orphan references silently). Returns an
 * empty array if the competency has no prerequisites in the dependency
 * map or if none of the prerequisites are in the graph.
 */
export function resolvePrerequisites(competencyId: string): string[] {
  const deps = COMPETENCY_DEPENDENCIES[competencyId];
  if (!deps) return [];
  const known = new Set(Object.keys(COMPETENCY_GRAPH));
  return deps.filter((d) => known.has(d));
}

import { generateQuestionsForLevel } from './src/levelGenerator';
import { detectMultiConcepts, generateRemediationVariants, getHumanReadableRemediation } from './src/services/remediation/blueprintEngine';

console.log('================================================================================');
console.log(' COMPLETE REMEDIATION NOTE FOR LEVEL 9: SHAPE & PATTERN SEQUENCES');
console.log('================================================================================\n');

const questions = generateQuestionsForLevel(9, 0);

questions.forEach((q, idx) => {
  const qText = q.question || `Level 9 Question ${idx + 1}`;
  const hintTopic = q.topic || '';
  const concepts = detectMultiConcepts(qText, hintTopic);

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`LEVEL 9 — QUESTION #${idx + 1}: "${qText}"`);
  console.log(`CONCEPTS INVOLVED (${concepts.length}): [ ${concepts.join(', ')} ]`);

  concepts.forEach((concept, cIdx) => {
    const remediation = getHumanReadableRemediation(concept, qText);
    const variants = generateRemediationVariants(qText, q.answer || '', 5, concept);

    console.log(`\n  👉 Concept #${cIdx + 1}: "${concept}"`);
    console.log(`     Student Guidance: "${remediation}"`);
    console.log(`     5 Practice Questions Generated:`);

    variants.forEach((v, vIdx) => {
      console.log(`       ${vIdx + 1}. ${v.question}`);
      if (v.options && v.options.length > 0) {
        console.log(`          Options: [${v.options.join(', ')}]`);
      }
      console.log(`          Answer: ${v.answer}`);
    });
  });
});

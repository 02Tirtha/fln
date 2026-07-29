import { generateQuestionsForLevel } from './src/levelGenerator';
import { detectMultiConcepts, generateRemediationVariants, getHumanReadableRemediation } from './src/services/remediation/blueprintEngine';

console.log('================================================================================');
console.log('  REMEDIATION VERIFICATION FOR ALL WORKSHEET QUESTIONS: LEVELS 1 TO 12');
console.log('================================================================================\n');

for (let level = 1; level <= 12; level++) {
  console.log(`\n================================================================================`);
  console.log(` 📘 LEVEL ${level} WORKSHEET QUESTIONS & REMEDIATION VERIFICATION`);
  console.log(`================================================================================`);

  // Generate 5 representative questions per level (covering sub-levels .0, .1, .2)
  const questions = generateQuestionsForLevel(level, 0).slice(0, 5);

  questions.forEach((q, idx) => {
    const qText = q.question || `Level ${level} Question ${idx + 1}`;
    const hintTopic = q.topic || '';
    const concepts = detectMultiConcepts(qText, hintTopic);

    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`LEVEL ${level} — QUESTION #${idx + 1}: "${qText}"`);
    console.log(`CONCEPTS INVOLVED (${concepts.length}): [ ${concepts.join(', ')} ]`);

    concepts.forEach((concept, cIdx) => {
      const remediation = getHumanReadableRemediation(concept, qText);
      const variants = generateRemediationVariants(qText, q.answer || '', 5, concept);

      console.log(`\n  👉 Concept #${cIdx + 1}: "${concept}"`);
      console.log(`     Remediation Guidance: "${remediation}"`);
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
}

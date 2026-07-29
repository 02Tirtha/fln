import { detectConcept, generateRemediationVariants, getHumanReadableRemediation } from '../src/services/remediation/blueprintEngine';

const sectionTypes = [
  'abacus-tens-ones',
  'add-subtract-match-mixed',
  'addition-objects',
  'addition-picture-boxes',
  'addition-tu-grid',
  'addition-vertical',
  'addition-vertical-boxed-grid',
  'angle-identify-type',
  'angle-measure-protractor',
  'area-shapes-find',
  'ascending-descending-scatter',
  'calendar-tasks',
  'choose-unit-mcq',
  'circle-greater-smaller-3digit',
  'clock-read-grid',
  'common-factors-multiples-mixed',
  'compare-decimals-configurable',
  'compare-equal-match',
  'comparison-boxed-3col',
  'comparison-diff-numeral',
  'comparison-grid-symbol',
  'comparison-icon-tick',
  'comparison-mixed-circle',
  'comparison-numeral',
  'count-and-tally',
  'count-equal-groups',
  'count-hand-match-table',
  'count-match-boxed',
  'count-trace-number-table',
  'count-write-match',
  'data-bargraph-qa',
  'data-pictograph-qa',
  'data-tally-chart-qa',
  'decimal-tenths-visual-write',
  'division-equal-sharing',
  'division-facts-vertical',
  'division-vertical-configurable',
  'division-vertical-remainder',
  'expanded-form-4digit',
  'fraction-compare-circle',
  'fraction-identify-visual',
  'fraction-op-numeric',
  'fraction-picture-application',
  'fraction-visual-op',
  'hand-number-mini-panels',
  'hand-object-match',
  'icon-count-compare-symbol',
  'identify-tool-mcq',
  'length-comparison-visual',
  'map-compass-circle',
  'map-follow-route',
  'map-identify-directions',
  'map-locate-objects-simple',
  'map-shortest-path',
  'measurement-mixed-mcq',
  'measuring-tool-mixed',
  'missing-numbers-3digit',
  'money-buy-object',
  'money-change',
  'money-count-visual',
  'multiplication-facts-row',
  'multiplication-missing-number',
  'multiplication-vertical-configurable',
  'number-grid-missing',
  'number-sequence-4digit',
  'number-sequence-blanks',
  'number-sequential-grid-fill',
  'number-trace-blocks',
  'odd-one-out',
  'odd-one-out-same-icon',
  'ordering-box-grid',
  'ordering-caterpillar',
  'ordering-caterpillar-3digit',
  'ordering-listed-boxes',
  'ordering-numbers',
  'ordinal-circle-write',
  'paperclip-measure',
  'pattern-mcq-circle',
  'pattern-shape-blanks',
  'pattern-table-single-blank',
  'perimeter-shapes-find',
  'place-value-4digit',
  'place-value-hto',
  'queue-position',
  'relation-comparison',
  'repeated-addition-only',
  'ruler-measure-objects',
  'sequence-blank-hand',
  'shape-object-match',
  'size-rank-boxes',
  'skip-count-arrows-boxes',
  'skip-count-simple-list',
  'skip-count-table-rows',
  'star-count-tens',
  'sticks-to-number',
  'subtraction-objects',
  'subtraction-picture-boxes',
  'subtraction-tu-grid',
  'subtraction-vertical',
  'subtraction-vertical-boxed-grid',
  'symmetry-identify',
  'tally-number-match',
  'tens-ones-blocks-mixed',
  'tens-ones-mixed',
  'tens-units-table',
  'three-size-comparison'
];

console.log('================================================================================');
console.log(`  TESTING CLASSIFICATION FOR ALL ${sectionTypes.length} FLN SECTION SLUGS`);
console.log('================================================================================\n');

let generalCount = 0;
sectionTypes.forEach((typeSlug, idx) => {
  const simulatedQuestion = `Level Assessment (${typeSlug}) — Item ${idx + 1}`;
  const concept = detectConcept(simulatedQuestion);
  const remediation = getHumanReadableRemediation(concept, simulatedQuestion);
  
  if (concept === 'General') {
    generalCount++;
    console.log(`[UNMAPPED] #${idx + 1}. "${typeSlug}" -> Classified as: "${concept}"`);
  } else {
    console.log(`[PASS] #${idx + 1}. "${typeSlug}" -> Concept: "${concept}"`);
  }
});

console.log(`\n================================================================================`);
console.log(` AUDIT SUMMARY: ${sectionTypes.length - generalCount} / ${sectionTypes.length} SLUGS MAPPED CLEANLY`);
console.log(` Unmapped Slugs: ${generalCount}`);
console.log('================================================================================\n');

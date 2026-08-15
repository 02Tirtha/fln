/**
 * Deterministic competency lookup.
 *
 * Goal: bridge the gap between the broad Question.topic (strand-level, e.g.
 * "Number Operations") used in the question-generation pipeline and the
 * granular competency ids that are keys in COMPETENCY_DEPENDENCIES
 * (e.g. "Carry Addition", "Place Value", "Counting").
 *
 * The function `competencyFromLevel(level)` does NOT contain a manually
 * authored level → competency table. It reuses the existing curriculum
 * data already present in the codebase:
 *
 *   1. CURRICULUM_MAPPING (config/curriculumMap.ts) — provides
 *      levelNumber → { levelTitle } for all 93 FLN levels. The levelTitle
 *      is the human-readable skill name from the FLN curriculum.
 *   2. COMPETENCY_DEPENDENCIES (competencyDependencies.ts) — the graph of
 *      granular competency prerequisites. Its keys are the canonical
 *      competency ids we want to feed into resolvePrerequisites().
 *
 * The deterministic rule is:
 *
 *   source_level
 *       ↓
 *   CURRICULUM_MAPPING[source_level].levelTitle
 *       ↓
 *   Is that levelTitle an exact key in COMPETENCY_DEPENDENCIES?
 *       ↓ yes                  ↓ no
 *   return levelTitle         return undefined
 *
 * No fuzzy matching. No "closest" competency. No picking the first
 * competency when a level maps to many. No random selection. If the
 * levelTitle is not itself a dependency-graph key, the function returns
 * undefined and the caller skips the question.
 *
 * This intentionally leaves ambiguous cases unresolved rather than
 * fabricating a competency. Multi-competency levels (e.g. L26, which the
 * FLN curriculum lists under both "Place Value", "Carry Addition", and
 * "Regrouping Tens and Ones") fall through to undefined unless the
 * question itself explicitly carries a competency.
 */

import { CURRICULUM_MAPPING } from './config/curriculumMap';
import { COMPETENCY_DEPENDENCIES } from './competencyDependencies';

/**
 * Look up the level's levelTitle from CURRICULUM_MAPPING and return it
 * only when it is itself an exact key in COMPETENCY_DEPENDENCIES.
 *
 * Returns undefined when:
 *   - the level has no entry in CURRICULUM_MAPPING
 *   - the levelTitle is not a key in COMPETENCY_DEPENDENCIES
 *
 * The caller MUST treat undefined as "no competency could be
 * deterministically derived for this question" and skip the question —
 * never fall back to Question.topic (which is the broad strand and
 * reintroduces the original bug).
 */
export function competencyFromLevel(level: number): string | undefined {
  const cfg = CURRICULUM_MAPPING[level];
  if (!cfg) return undefined;
  const title = cfg.levelTitle;
  if (!title) return undefined;
  if (!Object.prototype.hasOwnProperty.call(COMPETENCY_DEPENDENCIES, title)) {
    return undefined;
  }
  return title;
}
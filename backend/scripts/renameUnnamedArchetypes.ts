/**
 * Re-name archetypes that were created while Gemini was unreachable.
 *
 * When the model cannot be reached, `studentArchetypeService` still creates the
 * archetype — losing the child would be worse — and names it from its own
 * signature, e.g. "Unnamed pattern: digits written in reverse order + …".
 * Nothing renames it afterwards: the join path carries the existing name
 * through untouched, so a placeholder persists until something rewrites it.
 *
 * This is that something. Run it once the API key is healthy again.
 *
 *   npx tsx backend/scripts/renameUnnamedArchetypes.ts            # dry run
 *   npx tsx backend/scripts/renameUnnamedArchetypes.ts --apply    # write
 *
 * Safe to re-run: only archetypes still carrying a placeholder are considered,
 * and nothing is written when the model is still unavailable — a second
 * deterministic name in place of the first would be churn, not a fix.
 */
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '..', '.env') });

import { connectDB, dbStore, type MisconceptionCluster, type Worksheet } from '../src/db';
import { analyseCohort, nameArchetypes } from '../src/misconceptionFingerprint';
import { isPlaceholderArchetypeName as isPlaceholder } from '../src/studentArchetypeService';

const APPLY = process.argv.includes('--apply');
const CLASS_GROUPS = ['Class 2', 'Class 3', 'Class 4'];

async function main() {
  // Both, and in this order: `init()` only picks up Mongo if `connectDB()` has
  // already opened the client, otherwise it quietly falls back to the file DB
  // and this would report on an empty local store instead of the real one.
  await connectDB();
  await dbStore.init();
  if (!dbStore.useMongo) {
    throw new Error('Not connected to MongoDB — refusing to run against the file fallback.');
  }

  const clusters = (await dbStore.getMisconceptionClusters()) as MisconceptionCluster[];
  const stale = clusters.filter(c => isPlaceholder(c.name));
  console.log(`${clusters.length} archetype(s) stored, ${stale.length} still carrying a placeholder name.`);
  if (stale.length === 0) {
    console.log('Nothing to re-name.');
    return;
  }

  const [allStudents, submissions, worksheets] = await Promise.all([
    dbStore.getStudents(),
    dbStore.getAnswerSubmissions(),
    dbStore.getWorksheets()
  ]);

  let renamed = 0;
  let skippedOffline = 0;

  for (const classGroup of CLASS_GROUPS) {
    const targets = stale.filter(c => c.classGroup === classGroup);
    if (targets.length === 0) continue;

    // The cohort analysis is what reconstructs each archetype's distinctive
    // features, which is the only input the namer reasons from. Persistent
    // archetypes carry their cluster id in `slug`, which is how a named
    // archetype maps back to the record to update.
    const students = allStudents.filter(s => s.classGroup === classGroup);
    const ids = new Set(students.map(s => s.id));
    const analysis = await analyseCohort(
      students,
      submissions.filter(s => ids.has(s.studentId)),
      worksheets as Worksheet[],
      { classGroup }
    );

    // Matched on membership, not on `slug`. The analysis seeds `slug` with the
    // cluster id and then `assignStableIdentity` overwrites it with a name
    // derived from the group's statistics, so it is not a key back to the
    // record. A child belongs to exactly one archetype, so any member is.
    const clusterByStudent = new Map<string, MisconceptionCluster>();
    for (const cluster of targets) {
      for (const studentId of cluster.studentIds) clusterByStudent.set(studentId, cluster);
    }
    const clusterFor = (memberIds: string[]) => {
      for (const id of memberIds) {
        const hit = clusterByStudent.get(id);
        if (hit) return hit;
      }
      return undefined;
    };

    const toName = analysis.archetypes.filter(a => clusterFor(a.memberIds));
    if (toName.length === 0) {
      console.log(`\n${classGroup}: ${targets.length} placeholder archetype(s), but none appear in the current analysis — their members may no longer clear the evidence threshold. Left alone.`);
      continue;
    }

    await nameArchetypes(toName, classGroup);

    console.log(`\n${classGroup}:`);
    for (const archetype of toName) {
      const cluster = clusterFor(archetype.memberIds)!;
      // A fallback name is what we are trying to replace. Writing another one
      // would just swap one stand-in for a different stand-in.
      if (archetype.namedByFallback && !archetype.incoherent) {
        skippedOffline++;
        console.log(`  SKIP  ${cluster.id} — model unavailable, keeping "${cluster.name}"`);
        continue;
      }

      console.log(`  NAME  ${cluster.id}`);
      console.log(`          was: ${cluster.name}`);
      console.log(`          now: ${archetype.name}`);
      if (APPLY) {
        await dbStore.updateMisconceptionCluster({
          ...cluster,
          name: archetype.name,
          description: archetype.description,
          teacherAction: archetype.teacherAction,
          forwardRisk: archetype.forwardRisk,
          updatedAt: new Date().toISOString()
        });
      }
      renamed++;
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'} — ${renamed} archetype(s) ${APPLY ? 'renamed' : 'would be renamed'}, ${skippedOffline} skipped (model unavailable).`);
  if (!APPLY && renamed > 0) console.log('Re-run with --apply to write.');
  if (skippedOffline > 0) console.log('Gemini is still unreachable; re-run this once the quota resets.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Re-naming failed:', error);
    process.exit(1);
  });

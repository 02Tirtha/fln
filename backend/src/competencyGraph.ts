/**
 * Competency Dependency Graph for the FLN Curriculum.
 *
 * Built from the FLN Levels Structure markdown files in
 * `C:\FLN2\fln\FLN Levels Structure\`. Every competency in this graph
 * corresponds to either:
 *   - a level name (the `name` field of an entry in `FLN_LEVELS_LIST`
 *     in `backend/src/db.ts`), or
 *   - a topic listed under the "Topics Covered" section of one of the
 *     main level markdown files.
 *
 * No competency in this graph was invented or inferred. If a competency
 * name appears at multiple levels, a single node is kept and the `levels`
 * field records every level where it appears.
 *
 * Prerequisite and reinforcement edges are populated only when the
 * curriculum has an explicit progression statement. The FLN markdown
 * files do not contain a "Prerequisites" section, so every node in this
 * graph has empty `prerequisites` and `reinforcement` arrays. Dependents
 * are computed dynamically by `getDependents()`.
 */

import { getCompetencyLevels } from './_buildCompetencies';

export interface CompetencyNode {
  /** Stable identifier (the deduplicated competency name). */
  readonly id: string;
  /** Competency id(s) that must be mastered before this one. Always empty
   *  until the curriculum has explicit prereq statements to source. */
  readonly prerequisites: readonly string[];
  /** Competency id(s) where this is practiced in a downstream context.
   *  Always empty. */
  readonly reinforcement: readonly string[];
  /** Every FLN level where this competency appears. */
  readonly levels: readonly string[];
}

// ----------------------------------------------------------------------------
// Build the graph once at module load.
// ----------------------------------------------------------------------------

const LEVELS_BY_COMPETENCY = getCompetencyLevels();

/**
 * The dependency graph. One entry per deduplicated competency.
 *
 * `prerequisites` and `reinforcement` are empty for every node because the
 * FLN Levels Structure markdown files do not contain explicit prereq or
 * reinforcement sections. When the curriculum later adds such sections,
 * populate these arrays from the parsed data.
 */
export const COMPETENCY_GRAPH: Readonly<Record<string, CompetencyNode>> = (() => {
  const out: Record<string, CompetencyNode> = {};
  for (const [id, levels] of LEVELS_BY_COMPETENCY) {
    out[id] = {
      id,
      prerequisites: [],
      reinforcement: [],
      levels: Object.freeze([...levels]),
    };
  }
  return out;
})();

// ----------------------------------------------------------------------------
// Lookups and traversal helpers.
// ----------------------------------------------------------------------------

/**
 * Look up a single node by id. Returns `undefined` if the id is not in the
 * graph.
 */
export function getCompetencyNode(id: string): CompetencyNode | undefined {
  return COMPETENCY_GRAPH[id];
}

/**
 * Return every node id in the graph (sorted for determinism).
 */
export function getAllCompetencyIds(): string[] {
  return Object.keys(COMPETENCY_GRAPH).sort();
}

/**
 * Return every competency id, together with the levels it appears in.
 */
export function getAllCompetenciesWithLevels(): ReadonlyMap<string, readonly string[]> {
  const out = new Map<string, readonly string[]>();
  for (const [id, node] of Object.entries(COMPETENCY_GRAPH)) {
    out.set(id, node.levels);
  }
  return out;
}

/**
 * Dynamic, forward-edge traversal: every transitive dependent of `id`.
 * Computed by scanning the graph; the underlying `prerequisites` field is
 * never mutated.
 */
export function getDependents(
  id: string,
  visited: ReadonlySet<string> = new Set<string>()
): string[] {
  if (visited.has(id)) return [];
  const nextVisited = new Set<string>(visited);
  nextVisited.add(id);
  const out = new Set<string>();
  for (const [nodeId, node] of Object.entries(COMPETENCY_GRAPH)) {
    if (node.prerequisites.includes(id)) {
      out.add(nodeId);
      for (const d of getDependents(nodeId, nextVisited)) {
        out.add(d);
      }
    }
  }
  return Array.from(out).sort();
}

/**
 * Backward-edge traversal. Since every node currently has empty
 * `prerequisites`, this returns the direct `prerequisites` of `id` only.
 * The implementation is structurally a recursive walk, so adding real
 * prereq edges later (e.g. by parsing a future "Prerequisites" section
 * out of the FLN curriculum) will be picked up automatically.
 */
export function getPrerequisites(
  id: string,
  visited: ReadonlySet<string> = new Set<string>()
): string[] {
  if (visited.has(id)) return [];
  const nextVisited = new Set<string>(visited);
  nextVisited.add(id);
  const node = COMPETENCY_GRAPH[id];
  if (!node) return [];
  const out = new Set<string>();
  for (const prereq of node.prerequisites) {
    for (const p of getPrerequisites(prereq, nextVisited)) {
      out.add(p);
    }
    out.add(prereq);
  }
  return Array.from(out).sort();
}

/**
 * Forward traversal of the `reinforcement` edges.
 */
export function getReinforcement(
  id: string,
  visited: ReadonlySet<string> = new Set<string>()
): string[] {
  if (visited.has(id)) return [];
  const nextVisited = new Set<string>(visited);
  nextVisited.add(id);
  const node = COMPETENCY_GRAPH[id];
  if (!node) return [];
  const out = new Set<string>();
  for (const r of node.reinforcement) {
    for (const d of getReinforcement(r, nextVisited)) {
      out.add(d);
    }
    out.add(r);
  }
  return Array.from(out).sort();
}

// ----------------------------------------------------------------------------
// Validation.
// ----------------------------------------------------------------------------

export interface GraphValidationReport {
  totalNodes: number;
  totalPrerequisiteEdges: number;
  totalReinforcementEdges: number;
  acyclic: boolean;
  cycles: string[][];
  orphanPrerequisites: string[];
  duplicatePrerequisites: string[];
  orphanCompetencies: string[];
  traversalCheck: { id: string; prereqsReturned: number }[];
}

export function validateGraph(): GraphValidationReport {
  const ids = Object.keys(COMPETENCY_GRAPH);
  const idSet = new Set(ids);

  // Edge counts
  let totalPrereqEdges = 0;
  let totalReinforcementEdges = 0;
  for (const node of Object.values(COMPETENCY_GRAPH)) {
    totalPrereqEdges += node.prerequisites.length;
    totalReinforcementEdges += node.reinforcement.length;
  }

  // Orphan prerequisites: edges that point to a missing node
  const orphanPrerequisites: string[] = [];
  for (const node of Object.values(COMPETENCY_GRAPH)) {
    for (const p of node.prerequisites) {
      if (!idSet.has(p)) orphanPrerequisites.push(`${node.id} -> ${p}`);
    }
  }

  // Cycle detection
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
    const n = COMPETENCY_GRAPH[nodeId];
    if (n) {
      for (const child of n.prerequisites) {
        dfs(child);
      }
    }
    stack.pop();
    onStack.delete(nodeId);
  }
  for (const id of ids) dfs(id);

  // Duplicate prerequisites: a competency listed more than once in a
  // single node's prereq array
  const duplicatePrerequisites: string[] = [];
  for (const node of Object.values(COMPETENCY_GRAPH)) {
    const seen = new Set<string>();
    for (const p of node.prerequisites) {
      if (seen.has(p)) {
        duplicatePrerequisites.push(`${node.id} has duplicate prereq: ${p}`);
      }
      seen.add(p);
    }
  }

  // Orphan competencies: nodes that have neither a level nor any prereq
  // (a node with only a level and no edges is fine; a node with no level
  // and no edges looks invented)
  const orphanCompetencies: string[] = [];
  for (const [id, node] of Object.entries(COMPETENCY_GRAPH)) {
    if (node.levels.length === 0 && node.prerequisites.length === 0 && node.reinforcement.length === 0) {
      orphanCompetencies.push(id);
    }
  }

  // Traversal correctness: pick a few representative competencies and verify
  // getPrerequisites returns the expected number (0 for every node, since
  // all prereqs are currently empty)
  const traversalCheck = [
    'Counting',
    'Ascending Order',
    'Number Recognition (1-10)',
    'Comparison (Greater Than, Less Than, Equal To)',
  ]
    .filter((id) => COMPETENCY_GRAPH[id] !== undefined)
    .map((id) => ({ id, prereqsReturned: getPrerequisites(id).length }));

  return {
    totalNodes: ids.length,
    totalPrerequisiteEdges: totalPrereqEdges,
    totalReinforcementEdges: totalReinforcementEdges,
    acyclic: cycles.length === 0,
    cycles,
    orphanPrerequisites,
    duplicatePrerequisites,
    orphanCompetencies,
    traversalCheck,
  };
}

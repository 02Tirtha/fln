# FLN graph: the year before Class 1

**Decision record, 17 Sep 2026.** Curriculum decisions by Pavani, with research and drafting by Claude. Summarised to Jinal and Lakshya in the 17 Sep meeting.
**Graph checked at:** `origin/main` `af3f6710`.
**Relates to:** #388 (pilot slice), #482 (source sub-skills from NCERT/NIPUN/NCF), #469 (single `currentLevel` vs per-chain), and Jinal's 17 Sep email on the concept graph.

**What this PR changes:** research documents only. The prerequisite code is not edited. See [§9](#9-what-the-dev-team-does-next).

---

## 1. Why one stage at a time

Reviewing all 93 levels at once has been hard to follow, and the platform still has no working prototype. So we take **one stage through the whole loop** before touching the next:

1. Finalise the stage's nodes and prerequisites.
2. Generate its sheets.
3. Scan and capture responses.
4. Evaluate.
5. Carry the learnings into the next stage.

All other levels stay in the graph, untouched, until their turn.

**Sprint plan (17 Sep meeting):**
- the year before Class 1 end-to-end in about two days
- then Class 1, Class 2 and Class 3, about two days each

**The MVP ends at Class 3**, the FLN target. Class 4 and 5 content moves to a separate platform and is out of scope here.

## 2. Scope: the year before Class 1

- **Defined as "the year before Class 1", whatever the child's age.** The NCF-FS and NIPUN Bharat both say their age bands are indicative. A child may enter Class 1 at 5 or at 6.
  - The NCF-FS describes Balvatika as a one-year programme before Grade 1.
  - Some states (e.g. Maharashtra) call all three pre-school years Balvatika 1, 2 and 3.
  - So this document says "the year before Class 1", not "Balvatika".
- **Purpose:** before a child enters Class 1, do they have what Class 1 needs?
- **Not split into sub-stages.** Graph Stages 1–2 (L1–L17, pre-school years before this one) stay in the graph as they are. They are not assessed for now.

## 3. Which standard, and why

These are not competing standards. They are layers of one national system:

| Layer | Role |
|---|---|
| NEP 2020 | Policy: foundational literacy and numeracy for every child by Class 3 |
| NIPUN Bharat (2021) | Year-wise **targets**, Balvatika to Class 3; used for state-level measurement |
| NCF for the Foundational Stage (NCF-FS, 2022) | The **curriculum** for ages 3–8: learning outcomes, teaching, assessment |
| NCERT *Anand* Activity Book for Balvatika, Jaadui Pitara | Classroom **materials** |
| Aadharshila (Ministry of Women & Child Development, 2024) | Anganwadi curriculum for ages 3–6, **based on NCF-FS and NEP 2020** |
| State curricula | Built from the same set. Maharashtra's 2024 foundational-stage curriculum cites NCF-FS, the *Anand* books and Aadharshila (Pratham, *Situational Analysis Report on State Curricula*). |

**Decisions:**
- **Content = NCF-FS learning outcomes for this year.** It is the curriculum the other layers are built on.
- **Our earlier levels were built mainly from NIPUN Bharat.** NIPUN Bharat is the pass mark; the NCF-FS is the whole curriculum, and it goes further.
- **NIPUN Bharat's Balvatika targets = the readiness gate.** The report says:
  - "ready for Class 1" when the NIPUN items are met
  - "to strengthen" for any NCF-FS outcome not yet shown

  Missing an NCF-FS outcome does not hold a child back.
- **Task formats = NCERT *Anand***, because it is what children use in class.
- **The graph includes every curriculum outcome**, including ones that can only be observed. A node is not dropped because a sheet or observation mechanism doesn't exist yet.

## 4. Assessment rules for this stage

- **No tests.** NCF-FS §6.1.2(a): *"Explicit tests and examinations are completely inappropriate assessment tools for this Stage."*
  - There is **no question paper** at this stage, only **worksheets**.
  - Results are reported as **"ready / not yet"**, never pass/fail.
- **Two kinds of sheet**, matching the NCF-FS's two assessment methods (§6.2): analysing what the child produces, and observing the child.
  - **Student worksheet:** the child does the activity on paper.
  - **Teacher observation sheet:** the teacher watches each child and marks **tick or cross for every observed activity**. There is no shortcut: an observable skill has to be observed.
  - **Both are printed, filled in and scanned** through the existing scanning pipeline (`ai-services/PIPELINE.md`). The only difference is who writes on the sheet.
- **Teacher observation sheet layout: offer both, and the teacher chooses.**
  - a **class grid** (students × observable outcomes), easier for large classes
  - a **multi-page sheet with half a page per child**
- Tag every observation record **"teacher-observed"**, so reports can tell it apart from the child's own answers.
- **Until observation data exists,** observation-only nodes show **"not yet assessed"**, never "not ready". Otherwise every child's heat map shows false gaps.
- **Maths vocabulary** (NCF-FS C-8.12) is **a check on every teacher observation sheet**, not a node.
- **Worksheet layout (Amrita's feedback):** current papers are too crowded. For this stage especially, use:
  - much more open space between items, because young children write large
  - larger diagrams

## 5. The 30 NCF-FS outcomes and where each goes

**Source:** NCF-FS 2022, Annexure 1, Tables 29–41 (C-8.1 to C-8.13). Column C = age 5–6. Wording shortened.
**NIPUN ★:** one of NIPUN Bharat's six Balvatika numeracy targets (`FLN_foundation.md` §4).
**Sheet:** Student / Teacher / Both.
**Move vs split:** a curriculum judgement, approved 17 Sep.

### 5a. Already in the graph at this stage: keep

8 outcomes, on 6 nodes.

| # | Outcome | NIPUN | Node | Sheet | NCERT *Anand* task |
|---|---|---|---|---|---|
| 2 | Counts objects to 10; the last number said is the total | ★ | S3.2 (L19) | Both | Count and Write (Act. 66) |
| 7 | Recognises numerals to 9 | ★ | S3.1 (L18) | Student | Numbers (Act. 67) |
| 9 | Compares two numbers to 9 ("more than / less than") | ★ | S3.3 (L20) | Student | none found, to design |
| 14 | Sorts objects by features they recognise | ★ | S3.5 (L22) | Both | Colour the Shapes (Act. 19) |
| 15 | Arranges up to 5 objects by size, length or weight | ★ | S3.4 (L21), partly | Both | like Just the Right Size (Act. 39) |
| 19 | Classifies objects by three features | | S3.5 (L22), partly | Teacher | |
| 24 | Compares three objects by length or height | ★ | S3.7 (L24) | Student | Just the Right Size (Act. 39) |
| 25 | Compares three objects by weight | ★ | S3.7 (L24) | Both | |

### 5b. In an earlier-stage node: extend its definition (2)

| # | Outcome | Node | Change | Sheet |
|---|---|---|---|---|
| 6 | Sees 6 objects at a glance | S2.9 (L16) | ~4–6 → 6 | Teacher |
| 18 | Matches shapes of different sizes and orientations | S1.6 (L6) | identical shapes → any size or orientation | Student: Match the Shapes (Act. 15), Find and Match the Figure (Act. 57) |

### 5c. In a later-stage node: move to this stage (4)

Only the stage label changes; the S-code stays the same. Prerequisite links are unchanged unless noted.

| # | Outcome | Node | Sheet | Note |
|---|---|---|---|---|
| 4 | Zero as "none left" after taking away | S4.12 (L39, Class 1) | Student: Zero (Act. 68–69) | |
| 5 | 1st, 2nd, 3rd position | S4.13 (L40, Class 1) | Student | |
| 20 | Position words (inside, under, beside) | S5.13 (L55, Class 2) | Both | **Remove the incoming ⇢ edge from S5.12 (Class 2).** After the move it would point backwards. |
| 28 | Identifies Indian currency notes | S5.9 (L51, Class 2) | Student | |

### 5d. In a later-stage node: split off a new early node (11)

The later node keeps its content and existing links, and gains the new node as a prerequisite (see 5g).

| # | New node (proposed S-code) | Split from | Stays in the later node | Sheet |
|---|---|---|---|---|
| 1 | S3.11 Says number names to 20 | S4.3 (L30) Counting Objects to 20 | counting objects to 20 | Teacher |
| 8 | S3.13 Writes numerals to 9 | S4.4 (L31) Reading & Writing to 99 | to 99 | Student: Count and Write (Act. 66) |
| 10 | S3.14 Puts two groups together (total ≤ 9) and recounts, no + symbol | S4.6 (L33) Single-Digit Addition | with the + symbol | Both: Adding up the Vegetables (Act. 74) |
| 11 | S3.15 Takes away (≤ 9) and recounts, no − symbol | S4.7 (L34) Single-Digit Subtraction | with the − symbol | Both: 1 Less Plane (Act. 75) |
| 12 | S3.16 Makes small groups; counts objects and groups | S5.6 (L48) Multiplication as Repeated Addition | multiplication | Teacher |
| 13 | S3.17 Shares up to 20 objects equally among 4–5 | S5.7 (L49) Division as Equal Sharing | division problems | Both |
| 17 | S3.19 Describes the rule of a repeating pattern | S6.13 (L74) Pattern Rules | number-pattern rules | Teacher |
| 21 | S3.20 Describes solids in own words ("a ball rolls") | S4.8 (L35) 3D Shape Properties | faces, edges, corners | Teacher |
| 22 | S3.21 Traces the faces of 3D objects | S6.9 (L70) Relating 2D Faces to 3D | relating 2D to 3D | Teacher |
| 26 | S3.23 Compares how much two vessels hold | S4.10 (L37) Capacity Estimation | estimating with units | Teacher |
| 27 | S3.24 Names days of the week and months of the year | S5.14 (L56) Calendar Reading | reading a calendar | Teacher |

### 5e. Not in the graph: new nodes (4)

| # | New node (proposed S-code) | Sheet | Note |
|---|---|---|---|
| 3 | S3.12 Counts in any order; the total stays the same | Teacher | Only the final number shows on paper, not the counting order |
| 16 | S3.18 Creates a new pattern (colour, shape, size) | Both | Teacher checks that it repeats |
| 23 | S3.22 Draws circle, square, triangle freehand | Student | Teacher judges accuracy |
| 30 | S3.25 Solves simple number riddles and puzzles | Teacher | |

Row 29 (maths vocabulary) is a check on the teacher observation sheets, not a node (§4).

### 5f. Totals

| | Count |
|---|---|
| NCF-FS outcomes for this year | 30 (29 as nodes, plus vocabulary as a check) |
| Existing nodes kept for these outcomes | 6 |
| Earlier-stage nodes extended | 2 |
| Later-stage nodes moved to this stage | 4 |
| New nodes (11 split + 4 new) | 15 |
| Existing Stage-3 nodes with no NCF-FS column-C outcome (§7) | 4 |
| **Nodes in this stage's graph** | **31** |
| Sheets for the 29 outcome nodes: Student / Both / Teacher | 9 / 9 / 11 |

**All six NIPUN Bharat targets were already covered by Stage-3 nodes.** The gap was the rest of the curriculum.

### 5g. Prerequisites for the new nodes

Edge types follow Part 2 of `fln_level_networks.md`, using the surmise test *"does passing the downstream node make upstream mastery near-certain?"*
- **→** prereq
- **⇢** sequence only; no inference drawn

**Evidence key:**
- **NCF:** the NCF-FS learning-outcome trajectory. Each outcome builds on the earlier column's outcome in the same table (Annexure 1: "a trajectory… rather than exact age-specific goals").
- **G&G:** Gelman, R. & Gallistel, C. R. (1978). *The Child's Understanding of Number.* Harvard University Press. One of their five counting principles is **order irrelevance**: objects can be counted in any order without changing the result. It sits alongside one-one, stable order, cardinal and abstraction.
- **F&B:** Frydman, O. & Bryant, P. (1988). Sharing and the understanding of number equivalence by young children. *Cognitive Development*, 3(4), 323–339. **4-year-olds share by one-to-one "dealing" but usually don't connect sharing to equal numbers.**
- **VH:** Van Hiele levels, as already used in Chain D.
- **Reasoning:** no external source; stated in the note.

| Source | Target | Type | Evidence and note |
|---|---|---|---|
| S1.4 Rote counting to 10 | **S3.11** Number names to 20 | → | NCF C-8.3 (to 10 → to 20). Reciting to 20 contains reciting to 10. |
| **S3.11** | S4.3 Counting objects to 20 | → | You can't count 20 objects without the number names to 20 |
| S2.4 Counting to 5, cardinality | **S3.12** Counts in any order | → | G&G (order irrelevance); NCF C-8.3 places it at C, after cardinality at B. The judgement "the total stays the same" needs cardinality. |
| S3.1 Numeral recognition | **S3.13** Writes numerals to 9 | → | NCF C-8.5 (recognises at B → writes at C). Writing a numeral correctly implies recognising it. |
| **S3.13** | S4.4 Read/write to 99 | → | Writing to 99 contains writing to 9 |
| S2.5 Counting 6–10 | **S3.14** Puts groups together, recounts | → | NCF C-8.6 (to 5 at B → to 9 at C). Recounting to 9 needs counting to 9. |
| **S3.14** | S4.6 Single-digit addition | → | NCF C-8.6 (objects at C → addition facts at D) |
| S2.5 Counting 6–10 | **S3.15** Takes away, recounts | → | NCF C-8.6, same logic |
| **S3.15** | S4.7 Single-digit subtraction | → | NCF C-8.6 |
| **S3.15** | S4.12 Zero | ⇢ | NCF C-8.3 introduces zero through taking away. But a child can know zero as "none" without taking away up to 9, so it is sequence only. |
| S2.5 Counting 6–10 | **S3.16** Makes groups, counts them | → | NCF C-8.7 row 1. Counting the objects needs counting. |
| **S3.16** | S5.6 Multiplication as repeated addition | → | NCF C-8.7 (makes groups at C → multiplication by grouping at D) |
| S1.1 One-to-one correspondence | **S3.17** Shares equally | → | F&B: sharing is done by one-to-one dealing |
| S2.1 Quantity comparison | **S3.17** | ⇢ | F&B found children share by dealing **without** connecting it to equal numbers, so passing sharing does not certify comparison. Sequence only. |
| **S3.17** | S5.7 Division as equal sharing | → | NCF C-8.7 row 2 (shares at C → sharing for division problems at D). **S5.7 has no prerequisite edge today.** |
| S3.8 Patterns (2-item, 3-item) | **S3.18** Creates a new pattern | → | NCF C-8.2 (extends at B → creates at C) |
| S3.8 | **S3.19** Describes a pattern's rule | → | NCF C-8.2 (extends at B → describes rule at C) |
| **S3.19** | S6.13 Pattern rules | ⇢ | Repeating-pattern rules don't gate number-pattern rules. This follows Part 2's own S4.11 ⇢ S5.16 note on different modality. |
| S2.6 Shape identification | **S3.20** Describes solids in own words | → | VH Level 0 → 1, same as the existing S2.6 → S4.8 |
| **S3.20** | S4.8 3D shape properties | → | Naming faces, edges and corners implies describing solids informally |
| S2.6 Shape identification | **S3.21** Traces faces of 3D objects | → | Naming the traced shape needs shape identification. NCF C-8.8. |
| **S3.20** | **S3.21** | ⇢ | Tracing is hands-on and doesn't require describing. Same stage, sequence only. |
| **S3.21** | S6.9 Relating 2D faces to 3D | → | NCF C-8.8 (tracing faces at C → relating 2D and 3D later). Relating implies being able to find the faces. |
| S2.6 Shape identification | **S3.22** Draws shapes freehand | → | Drawing "a triangle" requires knowing which shape is a triangle. NCF C-8.8. |
| S2.8 Comparative vocabulary | **S3.23** Compares two vessels | ⇢ | NCF C-8.9 volume row (vocabulary at B → compares at C). Typed ⇢ following the 2026-08-21 demotion of S2.8 → S3.7. |
| **S3.23** | S4.10 Capacity estimation | → | Estimating capacity implies being able to compare it |
| **S3.24** Names days and months | S5.14 Calendar reading | → | NCF C-8.10. You can't read a calendar without the names. **S5.14 has no prerequisite edge today.** S3.24 is an entry point with no prerequisite. |
| S3.2 Numeral–quantity | **S3.25** Number riddles and puzzles | ⇢ | NCF C-8.13 ("uses number knowledge"). Riddles are oral and don't strictly need numerals, so sequence only. |

**Two orphan nodes fixed:** S5.7 (Division as Equal Sharing) and S5.14 (Calendar Reading) had no prerequisite edges before this change.

**OR prerequisites (#466):** every edge above is a single-route (AND) link, because the graph supports only AND today.

## 6. The graph for this stage

- Solid arrow = prereq (→). Dotted = sequence (⇢).
- Left: earlier-stage nodes feeding in. Right: later-stage nodes this stage feeds.
- New nodes are marked ★; moved and extended nodes are labelled.
- Edges between two earlier-stage nodes, or two later-stage nodes, are omitted.

```mermaid
flowchart LR
  subgraph IN["Earlier stages (not assessed now)"]
    S1_1["S1.1 One-to-one"]
    S1_4["S1.4 Rote counting to 10"]
    S1_7["S1.7 Perceptual subitizing"]
    S2_1["S2.1 Quantity comparison"]
    S2_2["S2.2 Seriation (3)"]
    S2_3["S2.3 Classification"]
    S2_4["S2.4 Counting to 5"]
    S2_5["S2.5 Counting 6–10"]
    S2_6["S2.6 Shape identification"]
    S2_7["S2.7 2-item patterns"]
    S2_8["S2.8 Comparative words"]
    S2_10["S2.10 Shape pieces"]
  end

  subgraph YR["Year before Class 1"]
    S1_6["S1.6 Shape matching (extended)"]
    S2_9["S2.9 Subitizing to 6 (extended)"]
    S3_1["S3.1 Numeral recognition"]
    S3_2["S3.2 Numeral–quantity"]
    S3_3["S3.3 Numeral comparison"]
    S3_4["S3.4 Seriation"]
    S3_5["S3.5 Flexible classification"]
    S3_6["S3.6 Sequencing"]
    S3_7["S3.7 Comparative words"]
    S3_8["S3.8 Patterns 2/3-item"]
    S3_9["S3.9 Shape properties"]
    S3_10["S3.10 Shape pictures"]
    S4_12["S4.12 Zero (moved)"]
    S4_13["S4.13 Ordinal position (moved)"]
    S5_9["S5.9 Currency notes (moved)"]
    S5_13["S5.13 Position words (moved)"]
    S3_11["★ S3.11 Number names to 20"]
    S3_12["★ S3.12 Counts in any order"]
    S3_13["★ S3.13 Writes numerals to 9"]
    S3_14["★ S3.14 Puts groups together"]
    S3_15["★ S3.15 Takes away"]
    S3_16["★ S3.16 Makes groups"]
    S3_17["★ S3.17 Shares equally"]
    S3_18["★ S3.18 Creates a pattern"]
    S3_19["★ S3.19 Describes pattern rule"]
    S3_20["★ S3.20 Describes solids"]
    S3_21["★ S3.21 Traces faces of 3D"]
    S3_22["★ S3.22 Draws shapes"]
    S3_23["★ S3.23 Compares two vessels"]
    S3_24["★ S3.24 Days and months"]
    S3_25["★ S3.25 Number riddles"]
  end

  subgraph OUT["Later stages"]
    S4_1["S4.1 Abstract comparison"]
    S4_3["S4.3 Counting objects to 20"]
    S4_4["S4.4 Read/write to 99"]
    S4_6["S4.6 Single-digit addition"]
    S4_7["S4.7 Single-digit subtraction"]
    S4_8["S4.8 3D shape properties"]
    S4_10["S4.10 Capacity estimation"]
    S4_11["S4.11 3-item patterns"]
    S4_15["S4.15 Shape (de)composition"]
    S5_6["S5.6 Multiplication"]
    S5_7["S5.7 Division as sharing"]
    S5_14["S5.14 Calendar reading"]
    S5_17["S5.17 Zero as placeholder"]
    S6_9["S6.9 2D faces of 3D"]
    S6_11["S6.11 Money arithmetic"]
    S6_13["S6.13 Pattern rules"]
  end

  %% existing edges touching this stage
  S1_7 --> S2_9
  S2_5 --> S3_1
  S3_1 --> S3_2
  S3_2 --> S3_6
  S2_1 --> S3_3
  S2_2 --> S3_4
  S2_3 --> S3_5
  S2_8 -.-> S3_7
  S2_7 -.-> S3_8
  S1_6 --> S3_9
  S2_10 --> S3_10
  S2_4 --> S4_12
  S3_2 --> S4_12
  S3_6 --> S4_13
  S3_3 --> S4_1
  S3_6 --> S4_3
  S3_7 --> S4_10
  S3_8 -.-> S4_11
  S3_9 -.-> S4_8
  S3_10 --> S4_15
  S4_12 --> S5_17
  S5_9 --> S6_11

  %% new edges (section 5g)
  S1_4 --> S3_11
  S3_11 --> S4_3
  S2_4 --> S3_12
  S3_1 --> S3_13
  S3_13 --> S4_4
  S2_5 --> S3_14
  S3_14 --> S4_6
  S2_5 --> S3_15
  S3_15 --> S4_7
  S3_15 -.-> S4_12
  S2_5 --> S3_16
  S3_16 --> S5_6
  S1_1 --> S3_17
  S2_1 -.-> S3_17
  S3_17 --> S5_7
  S3_8 --> S3_18
  S3_8 --> S3_19
  S3_19 -.-> S6_13
  S2_6 --> S3_20
  S3_20 --> S4_8
  S2_6 --> S3_21
  S3_20 -.-> S3_21
  S3_21 --> S6_9
  S2_6 --> S3_22
  S2_8 -.-> S3_23
  S3_23 --> S4_10
  S3_24 --> S5_14
  S3_2 -.-> S3_25
```

## 7. Stage-3 nodes with no NCF-FS column-C outcome (open)

These stay in the graph. Whether each stays as it is is still open.

- **S3.4 transitivity** (A>B, B>C ⇒ A>C). NCF-FS asks only for ordering up to 5 objects (row 15).
- **S3.6 Sequencing.** Matches NIPUN's "arranges by sequence". The app title is "Numeral Sequencing", but the definition includes events, and NCF-FS puts arranging events at age 3–4.
- **S3.8 extending patterns** and **S3.10 shape pictures.** NCF-FS puts these a column earlier. Its outcomes are cumulative, so they still apply.
- **S3.9 shape properties.** The closest NCF-FS outcome is describing solids (S3.20).

## 8. Still open

1. The §7 nodes.
2. How to score teacher-judged work (S3.18, S3.22).
3. What counts as "mastered" for this stage's nodes (Jinal's question D).
4. Check NIPUN's Balvatika targets against the original document, and whether they changed after NCF-FS (2022).
5. Which prerequisites are really OR (#466). Settle through teacher sessions, not on paper.

**Where Jinal's 17 Sep questions stand:**

| Question | Status |
|---|---|
| A / 3: OR prerequisites | Agreed in principle (#466). Which links are OR comes from teacher sessions. |
| B / 9: graph, not a ladder | Agreed. Spec §17 already says so. |
| C / 10–11: no single "Current Level"; mastery view | Agreed. Mastery per concept, not per strand. Observation nodes show "not yet assessed" until data exists. |
| D / 12: what counts as mastered | Open. Settle it for this stage first. |
| 1–2: two-digit addition | Class 1–2, waits its turn. The graph has no "2-digit addition without regrouping" node. |
| 4: early symmetry | **Out of MVP scope** (S7.17 is Class 4). |
| 5: perimeter | **Out of MVP scope** (S7.18 is Class 4). |
| 6: six-digit place value | **Out of MVP scope** (Class 4 and above). |
| 7–8: copying a pattern / identifying its rule | Partly answered here: S3.18 (creates) and S3.19 (describes the rule) now sit in this stage. |

## 9. What the dev team does next

- **`backend/src/competencyPrerequisites.ts` is generated from Part 2 of `fln_level_networks.md`.** This PR adds the new edges in a separate **Part 2b** of that document. They can't go straight into the chain tables, because the new S-codes don't exist in `curriculumMap.ts` yet, and `validateConceptPrerequisites()` rejects unknown ids.
- To take this into code:
  1. Register the 15 new nodes.
  2. Update the stage labels of the 4 moved nodes and the definitions of the 2 extended ones.
  3. Move the Part 2b rows into their chain tables.
  4. Regenerate the TypeScript. Only → edges are reproduced there.
- **Don't renumber existing levels.** `questionBankId()` builds the level number into stored question IDs (README §2). New nodes get new numbers at the end. The proposed S-codes (S3.11–S3.25) follow the existing stage convention; final ids are the dev team's call.
- **Worksheet generation** for this stage needs:
  - two sheet types (student, teacher observation)
  - both teacher layouts
  - roomier spacing and larger diagrams
  - the word "worksheet", not "question paper"

## Sources

- NCF for Foundational Stage 2022 (NCERT). §6.1.2, §6.2, Annexure 1 Tables 29–41. https://ncert.nic.in/pdf/NCF_for_Foundational_Stage_20_October_2022.pdf
- NCERT, *Anand*: Activity Book for Balvatika. https://ncert.nic.in/division/dek/pdf/JP_Content/56_Anand_Activity_Book_for_Balvatika-English.pdf
- NIPUN Bharat Mission & FLN Lakshyas. https://cdnbbsr.s3waas.gov.in/s3kv03f32614ba98288e85e9833e8a523e/uploads/2024/08/2024081816.pdf
- Pratham, *Situational Analysis Report on State Curricula*. https://www.pratham.org/wp-content/uploads/2026/04/7.-Situational-Analysis-Report-on-State-Curricula_Final.pdf
- Ministry of Women & Child Development, Early Childhood Care and Education (Aadharshila). https://www.wcd.gov.in/offerings/early-childhood-care-and-education
- Gelman, R. & Gallistel, C. R. (1978). *The Child's Understanding of Number.* Harvard University Press.
- Frydman, O. & Bryant, P. (1988). Sharing and the understanding of number equivalence by young children. *Cognitive Development*, 3(4), 323–339. https://www.sciencedirect.com/science/article/abs/pii/0885201488900196

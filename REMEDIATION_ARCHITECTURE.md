# Remediation Feature Architecture Documentation

## Overview

The **Remediation Feature** is an AI-driven personalized practice generation system that automatically creates targeted practice questions for students based on their incorrect answers in assessments. It operates as a background service triggered after evaluation, generating 5 practice variants per failed question with concept-matched, human-readable content.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REMEDIATION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│  │   EVALUATION │     │  REMEDIATION     │     │  BLUEPRINT       │   │
│  │   ENGINE     │────▶│  SERVICE         │────▶│  ENGINE          │   │
│  │   (Python)   │     │  (Node/TypeScript)│    │  (TypeScript)    │   │
│  │              │     │                  │     │                  │   │
│  └──────────────┘     └────────┬─────────┘     └────────┬─────────┘   │
│                                │                      │             │
│                                ▼                      ▼             │
│                       ┌──────────────────┐     ┌──────────────────┐ │
│                       │  GENERATIVE      │     │  CONCEPT         │ │
│                       │  ENGINE          │     │  DICTIONARY      │ │
│                       │  (Smart Router)  │     │  (JSON + AI)     │ │
│                       └────────┬─────────┘     └──────────────────┘ │
│                                │                                     │
│              ┌─────────────────┼─────────────────┐                  │
│              ▼                 ▼                 ▼                  │
│       ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│       │ NUMERIC    │    │ MATRIX     │    │ AI/GEMINI  │           │
│       │ ENGINE     │    │ ENGINE     │    │ API        │           │
│       └────────────┘    └────────────┘    └────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. RemediationService (`backend/src/services/remediation/remediation.service.ts`)

**Main orchestrator** — Two-phase async pipeline:

#### Phase A: Immediate Ledger Creation (`startGeneration`)
```typescript
async startGeneration(
  studentId: string, 
  examId: string, 
  failedQuestionNums: number[], 
  originalQuestions?: any[]
): Promise<{ ledgerId: string; status: string }>
```

**Responsibilities:**
- Creates/updates `RemediationLedger` with status `pending`
- Builds response objects for each failed question with metadata
- Stores in both MongoDB (Mongoose) and `dbStore` (JSON fallback)
- Triggers Phase B asynchronously (fire-and-forget)

**Input:** Student ID, Exam/Worksheet ID, array of failed question numbers, optional original questions array

**Output:** `{ ledgerId, status: 'pending' }`

#### Phase B: Background Generation (`runBackgroundGeneration`)
```typescript
private async runBackgroundGeneration(
  ledgerId: string, 
  studentId: string, 
  examId: string, 
  failedQuestionNums: number[]
): Promise<void>
```

**Responsibilities:**
- Updates ledger status to `generating`
- For each failed question:
  1. Resolves original question text from multiple sources (priority order)
  2. Detects concept via `detectConcept()`
  3. Routes to `GenerativeEngine.generateBatch()`
  4. Falls back to `blueprintEngine` if AI unavailable
  5. **Guaranteed fallback** via `getInlineFallback()` — never returns empty
- Updates ledger status to `completed` with practice questions
- Handles catastrophic failures → status `failed`

---

### 2. GenerativeEngine (`backend/src/services/remediation/generativeEngine.ts`)

**Smart 3-Engine Router** — Classifies question type and routes to optimal generator:

```typescript
type EngineType = 'numeric' | 'matrix' | 'api';

async generateBatch(
  originalQuestion: string,
  conceptName: string,
  questionType: string = 'standard',
  baseOffset: number = 0
): Promise<Array<{ question: string; answer: string; aiGenerated: boolean }>>
```

#### Classification Logic (`classifyEngine`)

| Engine | Trigger Conditions | Examples |
|--------|-------------------|----------|
| **Numeric** | Arithmetic keywords, counting, comparisons with numbers, place value, fractions, measurements, equations | "Solve: 23 + 45 = ?", "Count the apples", "Which is greater: 67 or 89?" |
| **Matrix** | Odd-one-out, classification, categories, fruits/animals/vehicles, colors | "Circle the odd one out: apple, banana, car, mango" |
| **AI/API** | Tracing, clock/time, tally marks, ordinal, money, maps, shape matching | "Trace the fish", "What time is it? 🕒", "Match tallies to numbers" |

#### AI Batch Generation (`generateBatchViaAI`)
- Single Gemini API call with structured JSON schema
- Generates **5 variants in one request**
- Validates: non-empty, not identical to original, no "Item N" placeholders
- **Keeps all valid AI variants** (previously required ≥3, now accepts ≥1)
- Pads missing slots with blueprint fallback, marked `aiGenerated: false`

#### Fallback Chain
```
AI API (Gemini) → BlueprintEngine → Inline Fallback (guaranteed)
```

---

### 3. BlueprintEngine (`backend/src/services/remediation/blueprintEngine.ts`)

**Deterministic Concept-Based Generator** — Zero AI dependency, human-readable questions

#### Key Features
1. **Numeric Mutator** (Priority 1) — If question contains numbers, mutates them in-place preserving sentence structure
   - Detects operation from context (add/subtract/multiply/divide)
   - Computes correct answer for mutated values

2. **Concept Generator Registry** (Priority 2) — 50+ concept-specific generators loaded from `conceptDictionary.json`
   - Each generator produces `BlueprintQuestion` with: question, answer, topic, options, answerMode, remediation hint
   - Supports dropdown answers for discrete-choice concepts (fractions, measurement, tally matching, etc.)

3. **Domain-Aware Fallback** (Priority 3) — Infers operation from conceptName when concept detection fails

#### Generator Registry (Key Concepts)
```typescript
const GENERATORS = {
  'fractions': generateFractions,           // Dropdown: 1/2, 1/3, 1/4
  'addition': generateAddition,             // 3-digit carry support
  'subtraction': generateSubtraction,       // 3-digit borrow support
  'multiplication': generateMultiplication,
  'division': generateDivision,
  'division (equal sharing)': generateDivisionEqualSharing,
  'division (equal grouping)': generateDivisionEqualGrouping,
  'place value': generatePlaceValue,
  'ordering': generateOrdering,             // Ascending/descending, 3-digit aware
  'comparison': generateComparison,
  'patterns': generatePatterns,             // Shape + numeric sequences
  'time': generateTime,                     // Clock face descriptions
  'geometry': generateGeometry,             // Angles + shapes
  'money': generateMoney,                   // Change calculation
  'measurement': generateMeasurement,       // Unit selection dropdown
  'unit conversion': generateUnitConversion,
  'factors': generateFactors,
  'multiples': generateMultiples,
  'common factors': generateCommonFactors,
  'common multiples': generateCommonMultiples,
  'matchfingerstofruits': generateMatchFingersToFruits,  // Dropdown matching
  'add and match': generateAddAndMatch,     // Dropdown addition
  'match the tallies': generateMatchTheTallies, // Tally counting dropdown
  // ... 20+ more concepts
};
```

#### Matching Exercise Utility
```typescript
generateMatchingExercise(
  variantIndex: number,
  sourceItems: string[],
  targetPool: string[],
  topicName: string
): BlueprintQuestion
```
- Deterministic shuffle with seed for reproducibility
- Returns dropdown options + correct answer

---

### 4. Concept Dictionary (`backend/src/services/remediation/conceptDictionary.json`)

**Keyword-to-Concept Mapping** — 200+ entries for auto-detection:

```json
{
  "fractions": ["fraction", "shaded", "numerator", "denominator", "equal parts", "1/2", "1/3", "1/4"],
  "addition": ["add", "addition", "plus", "sum", "carry", "carrying", "total", "altogether"],
  "subtraction": ["subtract", "subtraction", "minus", "difference", "take away", "borrow", "borrowing", "left", "remaining", "change", "spent", "paid"],
  "multiplication": ["multiply", "multiplication", "times", "product", "×", "each costs"],
  "division": ["divide", "division", "quotient", "÷", "share", "sharing", "grouping", "equal groups", "per group"],
  "place value": ["place value", "hundreds", "tens", "ones", "units", "hto", "3-digit"],
  "time": ["clock", "time", "hour", "minute", "half past", "o'clock", "🕒"],
  "geometry": ["angle", "angles", "degree", "protractor", "90", "acute", "obtuse", "right", "straight"],
  "money": ["rupee", "₹", "coin", "currency", "change", "cost", "paid"],
  "measurement": ["meter", "centimeter", "kilogram", "gram", "liter", "milliliter", "length", "weight", "capacity"],
  "tally": ["tally", "tallies", "||||/", "vertical marks"],
  "ordinal": ["ordinal", "1st", "2nd", "3rd", "position", "queue"],
  // ... 40+ more concepts
}
```

#### Detection Pipeline (`detectConcept`)
1. **Explicit hint** from caller (highest priority)
2. **Keyword matching** — Longest keyword first (sorted by length desc)
3. **AI Classifier fallback** (`aiClassifyConcept` — calls Python/Groq)
4. **Default** → "General"

---

### 5. Specialized Engines

#### NumericEngine (`numericEngine.ts`)
```typescript
generate(variantIndex, originalQuestion, conceptName, originalAnswer, baseOffset)
```
- Extracts numbers from question text
- Mutates each number with deterministic offset
- Re-computes answer based on detected operation
- Preserves full sentence structure

#### MatrixEngine (`matrixEngine.ts`)
```typescript
generate(variantIndex, originalQuestion, conceptName, originalAnswer, baseOffset)
```
- Handles: odd-one-out, shape matching, color grouping, category classification
- Builds target/foil item groups from concept keywords
- Returns dropdown options with shuffled correct answer

---

### 6. Data Models

#### RemediationLedger (`backend/src/models/RemediationLedger.model.ts`)
```typescript
interface IRemediationLedger {
  id: string;                    // "rem_<uuid>"
  studentId: string;
  studentName: string;
  examId: string;                // Worksheet/diagnostic ID
  worksheetId: string;
  score: number;                 // Failed count
  totalQuestions: number;        // Failed count
  remediationStatus: 'pending' | 'generating' | 'completed' | 'failed';
  responses: IRemediationResponse[];
  createdAt: Date;
  updatedAt: Date;
}

interface IRemediationResponse {
  questionNumber: number;
  conceptName: string;
  type: 'numeric' | 'matrix' | 'generative';
  questionType: string;          // Original question type
  originalQuestion: string;
  originalAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;            // Always false (failed questions)
  practiceQuestions: IGeneratedPracticeQuestion[];
}

interface IGeneratedPracticeQuestion {
  question: string;
  answer: string;
  options?: string[];            // For dropdown mode
  answerMode?: 'text' | 'dropdown';
  remediation?: string;          // Human-readable hint
  generatedAt: Date;
  aiGenerated: boolean;
  needsReview?: boolean;         // Flagged for teacher review
}
```

#### ExamBlueprint (`backend/src/models/ExamBlueprint.model.ts`)
```typescript
interface IExamBlueprint {
  worksheetId: string;
  studentId: string;
  levelId: number;
  sublevelId: string;
  items: IBlueprintItem[];
  createdAt: Date;
}

interface IBlueprintItem {
  questionNumber: number;
  questionId: string;
  originalQuestion: string;
  correctAnswer: string;
  topic: string;
  questionType: string;
  sectionId: string;
  sectionName: string;
}
```

---

## API Endpoints

### Trigger Remediation (Internal)
```http
POST /api/students/:id/level-worksheet/submit
```
- Called after ICR scan submission
- Auto-detects failed questions → calls `remediationService.startGeneration()`

```http
POST /api/students/:id/diagnostic/submit
```
- Called after diagnostic evaluation
- Triggers remediation for failed diagnostic questions

### Retrieve Remediation Notes (Frontend)
```http
GET /api/remediation/note/:studentId/:examId
```
- Returns ledger with all practice questions
- Used by `RemediationNotesView` component

```http
GET /api/remediation/ledger/:studentId
```
- Lists all remediation ledgers for a student

---

## Frontend Integration

### RemediationNotesView (`frontend/src/components/RemediationNotesView.tsx`)
- Route: `/remediation-note/:studentId/:examId`
- Fetches ledger via `/api/remediation/note/:studentId/:examId`
- Renders:
  - Original failed question + student's wrong answer
  - 5 practice variants with answers
  - Concept tag + remediation hint
  - AI-generated vs fallback badges
  - "Needs Review" warning flags

### Panel Integration
- Accessible from Teacher/Volunteer dashboards via "Remediation Notes" panel
- Links from evaluation reports → remediation view

---

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  STUDENT    │     │  EVALUATION  │     │  REMEDIATION     │
│  SUBMITS    │────▶│  ENGINE      │────▶│  SERVICE         │
│  ANSWERS    │     │  (Python)    │     │  startGeneration │
└─────────────┘     └──────────────┘     └────────┬─────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  FRONTEND   │◀───│  LEDGER      │◀───│  BACKGROUND      │
│  DISPLAYS   │     │  (Completed) │     │  GENERATION      │
│  PRACTICE   │     │              │     │  (GenerativeEng) │
└─────────────┘     └──────────────┘     └──────────────────┘
```

### Detailed Background Generation Flow

```
runBackgroundGeneration(ledgerId)
    │
    ├─▶ Update status: 'generating'
    │
    ├─▶ For each failed question:
    │     │
    │     ├─▶ findOriginalQuestion(examId, qNum)
    │     │     ├─▶ Check ledger.responses cache
    │     │     ├─▶ Check ExamBlueprint (blueprintService)
    │     │     ├─▶ Check LevelWorksheet answerKey (dbStore)
    │     │     ├─▶ Check Worksheet questions (dbStore)
    │     │     └─▶ Derive from levelGenerator (examId pattern)
    │     │
    │     ├─▶ detectConcept(originalQuestion, hintConcept)
    │     │     ├─▶ Keyword match (conceptDictionary.json)
    │     │     └─▶ AI classifier fallback
    │     │
    │     ├─▶ generativeEngine.generateBatch()
    │     │     ├─▶ classifyEngine() → numeric/matrix/api
    │     │     ├─▶ numericEngine / matrixEngine / AI API
    │     │     └─▶ Fallback: blueprintEngine → inlineFallback
    │     │
    │     └─▶ Build practiceQuestions array (5 items)
    │
    └─▶ Update ledger: status='completed', responses with practiceQuestions
```

---

## Configuration & Constants

### Magic Numbers (Should be centralized)
| Value | Location | Purpose |
|-------|----------|---------|
| `5` | `generativeEngine.ts:123`, `blueprintEngine.ts:979` | Practice variants per question |
| `3` | `run_pipeline.py:68` | AI evaluation retries |
| `8h` | SRS §6.6 | Evaluation delay after submission window |

### Answer Mode Mapping (`getAnswerMode`)
```typescript
const DROPDOWN_CONCEPTS = new Set([
  'fractions', 'complete the whole', 'measurement', 'unit conversion',
  'percentages', 'geometry', 'time', 'probability',
  'match fingers to fruits', 'add and match', 'match the tallies', 'tally'
]);
```

---

## Error Handling & Resilience

### Guaranteed Fallback Chain
```
AI API (Gemini/Groq) 
    ↓ fail
BlueprintEngine.generateRemediationVariants() 
    ↓ fail/empty
RemediationService.getInlineFallback()  ← NEVER FAILS
```

### Migration System (`migrateAllStaleLedgers`)
- Runs at server startup (fire-and-forget)
- Refreshes ALL historical ledgers with topic-specific questions
- Detects stale content via pattern matching:
  - "Numeric practice for..."
  - "Practice for..."
  - "Solve calculation: X + Y" (wrong operation for subtraction/division)
  - Placeholder text patterns
- Updates both MongoDB and dbStore

---

## Testing & Verification

### Manual Test Flow
1. Login as Teacher → Dashboard → Student → Diagnostic/Worksheet
2. Submit answers with intentional errors
3. Navigate to `/remediation-note/:studentId/:examId`
4. Verify:
   - Original question + student's wrong answer shown
   - 5 practice variants generated
   - Concept detected correctly
   - Answers are mathematically correct
   - Dropdown mode for tally/fraction/matching concepts

### Key Test Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Subtraction question failed | Practice questions show subtraction (not addition) |
| Division equal sharing | Practice shows sharing context, correct quotient |
| Tally marks counting | Dropdown with tally string + number options |
| Fraction shaded parts | Dropdown: 1/2, 1/3, 1/4, 2/3, 3/4 |
| 3-digit addition with carry | Practice uses 3-digit numbers, correct carry |
| Clock time reading | Clock face description, correct time format |
| Shape tracing | "Trace the [shape]" instruction preserved |
| AI API unavailable | BlueprintEngine generates all 5 variants |

---

## Deployment Notes

### Required Environment Variables
```env
GEMINI_API_KEY=xxx          # For AI generation (optional — has fallback)
GROQ_API_KEY=xxx            # Alternative AI provider (used by Python pipeline)
AI_SERVICES_DIR=../ai-services
CHROME_EXECUTABLE_PATH=     # For Puppeteer PDF generation
```

### Python Pipeline Integration
- `run_pipeline.py` invoked via `execSync` from `index.ts:680`
- Reads student responses from `ai-services/student_responses/class_N/phrase_X/STD_XXXXX.json`
- Writes evaluation reports to `ai-services/evaluation_reports/class_N/phrase_X/`
- Remediation triggered AFTER evaluation completes

### Database
- MongoDB collections: `remediationledgers`, `examblueprints`
- JSON fallback: `dbStore.getRemediationLedgers()`, `blueprintService` in-memory Map

---

## Known Issues & Technical Debt

1. **Hardcoded `5` variants** — Should be configurable per concept/role
2. **execSync for Python** — Command injection risk; should use `pythonBridge.ts` (planned)
3. **Duplicate concept detection** — `detectConcept` in blueprintEngine + `conceptClassifier.ts`
4. **No unit tests** — Critical paths untested
5. **Mongoose + JSON dual-write** — Complexity; should unify behind repository
6. **AI model IDs hardcoded** in `gemini.ts` and Python `_api.py` — Should be in config

---

## Future Enhancements

1. **Adaptive variant count** — More variants for weaker concepts
2. **Teacher review workflow** — `needsReview` items → Superadmin queue
3. **Student-facing practice mode** — Interactive practice with instant feedback
4. **Spaced repetition scheduling** — Re-surface failed concepts over time
5. **Multi-language support** — Hindi/Punjabi question generation
6. **Analytics dashboard** — Remediation effectiveness per concept/school

---

## File Reference Map

| File | Purpose |
|------|---------|
| `backend/src/services/remediation/remediation.service.ts` | Main orchestrator, 2-phase pipeline |
| `backend/src/services/remediation/generativeEngine.ts` | Smart router (numeric/matrix/AI) |
| `backend/src/services/remediation/blueprintEngine.ts` | Deterministic concept generators |
| `backend/src/services/remediation/numericEngine.ts` | Numeric mutation engine |
| `backend/src/services/remediation/matrixEngine.ts` | Classification/matching engine |
| `backend/src/services/remediation/conceptClassifier.ts` | AI concept classification |
| `backend/src/services/remediation/conceptDictionary.json` | Keyword→concept mapping |
| `backend/src/services/remediation/blueprintService.ts` | ExamBlueprint CRUD |
| `backend/src/services/remediation/paperBatchProcessor.ts` | Batch paper processing |
| `backend/src/models/RemediationLedger.model.ts` | Mongoose schema |
| `backend/src/models/ExamBlueprint.model.ts` | Mongoose schema |
| `backend/src/interfaces/remediationLedger.interface.ts` | TypeScript interfaces |
| `backend/src/routes/remediation.routes.ts` | API endpoints |
| `backend/src/controllers/remediation.controller.ts` | Request handlers |
| `frontend/src/components/RemediationNotesView.tsx` | Student remediation UI |
| `ai-services/scripts/2_evaluate_child.py` | Evaluation → triggers remediation |
| `ai-services/scripts/_api.py` | Shared AI client (Groq/Gemini) |

---

*Generated from codebase analysis — Last updated: 2026-07-29*
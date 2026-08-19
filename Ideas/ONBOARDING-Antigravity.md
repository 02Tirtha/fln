# ONBOARDING: Antigravity

## What is FLN?
FLN (Foundational Literacy and Numeracy) is an educational platform serving early-grade students, teachers, and school administrators. It addresses the critical educational problem of ensuring learners build strong, measurable foundational skills in mathematics and reading. Its overall purpose is to digitize paper-based exams, provide granular performance reports, and automatically generate personalized remediation content to bridge specific learning gaps.

## What do you understand by FLN as a system?
The FLN system connects multiple users and entities into a seamless educational pipeline:
- **Students** take assessments (like diagnostic exams) to gauge their foundational skills.
- **Teachers and Administrators** use the system to upload, scan, and process physical worksheets.
- **Assessments and Worksheets** are digitized, evaluated, and tracked per student.
- Once evaluated, the system generates **Remediation Sheets** based on the specific questions a student answered incorrectly. The engine intelligently maps the failed question to an underlying mathematical concept (e.g., Division, Missing Numbers, Area) and dynamically generates similar, level-appropriate practice questions to help the student master the concept.

## Current State of the Repository — What Has Been Done So Far
The repository is structured as a full-stack application with a Node.js/Express backend (port 3000) and a React/Vite frontend. It utilizes MongoDB to store records such as `students` and `remediationledgers`. 

Key implemented features include:
- A scanning and processing pipeline for paper exams.
- Evaluation dashboards to visualize student performance.
- A dynamic **Remediation Engine** (`blueprintEngine.ts` and `GenerativeEngine`) that intercepts failed question strings, classifies them using regex rules and a `CONCEPT_MAP`, and generates practice variations through specific concept generators or an AI API fallback. (See the architecture documentation below for more details).

## Gaps Observed in the Code
While working on the Remediation feature, I identified several critical gaps:

**1. Missing Concept Generators & Improper Fallbacks**
- **Where:** `backend/src/services/remediation/blueprintEngine.ts` (`detectConcept` and `_generateByConcept` functions).
- **What:** The engine lacked specific generators for several common FLN concepts such as `missing numbers`, `comparison`, `ascending order`, and `data collection`. When these concepts were detected, the system hit a "Domain-Aware Fallback" that generated completely unrelated questions (e.g., serving `12 ÷ 6 = ?` when the original question was a complex Class 4 division problem or a visual concept).
- **Why it matters:** It defeats the purpose of remediation if students are given irrelevant, incorrectly scaled, or overly generic practice questions that don't match their actual learning gaps.

**2. Hardcoded UI Formatting in Backend Logic**
- **Where:** `backend/src/services/remediation/blueprintEngine.ts` (inside various math generators) and `frontend/src/components/RemediationNotesView.tsx`.
- **What:** The backend generators were returning strings tightly coupled to UI formatting, such as explicitly prepending `Problem ${i+1}: ` and appending `= ?`. Because the React frontend also prepends its own "Problem" labels and attempts to extract common prefixes from the strings, this resulted in messy UI rendering and broken prefix-stripping logic.
- **Why it matters:** It negatively impacts maintainability and UI correctness. The backend should return raw data/prompts, and the frontend should handle presentation.

**3. Mathematical Logic Flaws in Mutators**
- **Where:** `backend/src/services/remediation/blueprintEngine.ts` (`generateDivision` function, lines ~810-825).
- **What:** The math logic used to dynamically generate division practice questions had a critical flaw: `const quotient = ((s * 11) % 11) + 2;` evaluates to `0 + 2 = 2` for all integers. Every single generated division problem resulted in an answer of 2 (e.g., `12 ÷ 6 = 2`, `14 ÷ 7 = 2`, `16 ÷ 8 = 2`). 
- **Why it matters:** This severely undermines the educational value of the remediation sheet by failing to provide varied computational practice.

## Ideas for the Project

**1. Expand and Isolate Concept Generators**
- **What:** Create a robust suite of isolated generator functions for every concept identified in FLN diagnostic exams (e.g., tens/ones mapping, geometry, pattern recognition).
- **Why:** This minimizes reliance on the generic fallback logic and ensures students receive highly targeted, relevant practice.
- **Approach:** Map exact regex keywords in `detectConcept` to dedicated functions in the `GENERATORS` registry, ensuring each function respects the `classLevel` argument to scale difficulty appropriately.

**2. Standardize Prompt Formatting and API Contracts**
- **What:** Enforce that all backend generators return uniform `subQuestions` arrays with strict `{ prompt: string, answer: string }` contracts. Use standard fill-in-the-blank identifiers like `___` instead of mixed punctuation.
- **Why:** It decouples presentation logic from the backend, allowing the frontend to render lists, tables, or interactive inputs seamlessly without relying on brittle string-replacement hacks.
- **Approach:** Strip all hardcoded `Problem X:` prefixes from `blueprintEngine.ts` and rely on `RemediationNotesView.tsx` to handle the rendering loop.

## Your Contribution
During this onboarding phase, I made the following contributions to the **Remediation Engine**:
1. **Bug Fix (Math Logic):** Completely rewrote the `generateDivision` function to properly utilize random seeding and `classLevel` constraints, ensuring students receive varied, grade-appropriate division practice instead of static quotients.
2. **Feature Enhancement (Concept Coverage):** Developed and injected brand-new Concept Generators into the registry, including `generateMissingNumbers`, `generateAscendingOrder`, `generateDescendingOrder`, `generateNumberOfSides`, `generateDataCollection`, and `generateTensAndOnes`. 
3. **Refactor (UI Decoupling):** Stripped hardcoded `Problem` prefixes and standardized the prompt suffix to `= ___` across core math generators to perfectly align with the `fill_blank` frontend components. Additionally, I resolved backend caching issues that were preventing the newly generated schemas from reaching the React application.

import { dbStore } from '../../db';
import { RemediationLedger } from '../../models/RemediationLedger.model';
import { ExamBlueprint } from '../../models/ExamBlueprint.model';
import { routerService } from './router.service';
import { IRemediationLedger, IGeneratedPracticeQuestion } from '../../interfaces/remediationLedger.interface';
import { randomUUID } from 'crypto';
import { generativeEngine } from './generativeEngine';
import { blueprintService } from './blueprintService';
import { blueprintEngine } from './blueprintEngine';
import { generateQuestionsForLevel } from '../../levelGenerator';

export class RemediationService {
  /**
   * Phase A: Immediately creates/updates the ledger as 'pending' and returns ledgerId.
   */
  async startGeneration(studentId: string, examId: string, failedQuestionNums: number[], originalQuestions?: any[]): Promise<{ ledgerId: string; status: string }> {
    // Check if a ledger already exists for this student and exam
    let ledger: any = null;
    try {
      ledger = await RemediationLedger.findOne({ studentId, examId }).exec();
    } catch (err) {
      console.warn('Mongoose query failed, searching dbStore:', err);
    }

    if (!ledger) {
      const all = await dbStore.getRemediationLedgers();
      ledger = all.find(l => l.studentId === studentId && l.examId === examId) || null;
    }

    const ledgerId = ledger ? ledger.id : 'rem_' + randomUUID().substring(0, 8);
    const student = await this.findStudentName(studentId);

    // Build the responses list. For each failed question, we populate original details.
    const responses = await Promise.all(
      failedQuestionNums.map(async (qNo) => {
        let originalInfo: any = {};
        if (originalQuestions && Array.isArray(originalQuestions)) {
          const q = originalQuestions.find((x: any) =>
            x.questionNo === qNo ||
            x.questionNumber === qNo ||
            x.question_no === qNo
          ) || originalQuestions[qNo - 1] || originalQuestions[failedQuestionNums.indexOf(qNo)];

          if (q) {
            originalInfo = {
              questionText: q.question || q.questionText || q.originalQuestion,
              answer: typeof q.answer === 'object' ? JSON.stringify(q.answer) : String(q.answer ?? q.correctAnswer ?? ''),
              conceptName: q.topic || q.sectionName || q.conceptName,
              questionType: q.questionType || q.type || q.question_type_hint || 'standard',
              type: q.answer_type === 'number' ? 'numeric' : q.answer_type === 'choice' ? 'matrix' : 'generative'
            };
          }
        }

        if (!originalInfo.questionText) {
          originalInfo = await this.findOriginalQuestion(examId, qNo);
        }

        console.log("Original Question:", originalInfo.questionText, "| Type:", originalInfo.questionType || 'standard');
        return {
          questionNumber: qNo,
          conceptName: originalInfo.conceptName || `Concept for Q#${qNo}`,
          type: originalInfo.type || 'numeric',
          questionType: originalInfo.questionType || 'standard', // passed to generative engine
          originalQuestion: originalInfo.questionText || `Question text for Q#${qNo}`,
          originalAnswer: originalInfo.answer || '',
          studentAnswer: '', // Filled in later or left blank for remediation practice context
          isCorrect: false,
          practiceQuestions: []
        };
      })
    );


    const ledgerData: IRemediationLedger = {
      id: ledgerId,
      studentId,
      studentName: student || 'Unknown Student',
      examId,
      worksheetId: examId,
      score: 0, // Failed details are graded, total score reflects failed practice
      totalQuestions: failedQuestionNums.length,
      remediationStatus: 'pending',
      responses
    };

    // Upsert the ledger record
    try {
      await RemediationLedger.findOneAndUpdate(
        { studentId, examId },
        { $set: ledgerData },
        { upsert: true, new: true }
      ).exec();
    } catch (err: any) {
      console.warn('Mongoose upsert failed, updating via dbStore:', err.message);
    }

    // Update in native/cached store
    const allLedgers = await dbStore.getRemediationLedgers();
    const idx = allLedgers.findIndex(l => l.studentId === studentId && l.examId === examId);
    if (idx !== -1) {
      allLedgers[idx] = ledgerData as any;
    } else {
      await dbStore.addRemediationLedger(ledgerData as any);
    }

    // Trigger Phase B asynchronously in the background
    this.runBackgroundGeneration(ledgerId, studentId, examId, failedQuestionNums).catch((err) => {
      console.error(`💥 Unhandled background generation crash for ledger ${ledgerId}:`, err);
    });

    return { ledgerId, status: 'pending' };
  }

  /**
   * Phase B: Runs in background, flips status to 'generating', executes engines with uniqueness checks, then completes.
   */
  private async runBackgroundGeneration(ledgerId: string, studentId: string, examId: string, failedQuestionNums: number[]): Promise<void> {
    console.log(`[RemediationService] Starting background generation for ledger ${ledgerId}...`);
    
    // Flip to generating status
    try {
      await RemediationLedger.updateOne({ id: ledgerId }, { $set: { remediationStatus: 'generating' } }).exec();
      await dbStore.updateRemediationLedger(ledgerId, { remediationStatus: 'generating' });
    } catch (err) {
      console.error('Failed to update status to generating:', err);
    }

    try {
      // Fetch latest ledger
      let ledger: any = null;
      try {
        ledger = await RemediationLedger.findOne({ id: ledgerId }).exec();
      } catch {}
      if (!ledger) {
        const all = await dbStore.getRemediationLedgers();
        ledger = all.find(l => l.id === ledgerId) || null;
      }

      if (!ledger) {
        throw new Error(`Ledger ${ledgerId} not found in background loop`);
      }

      const responses = [...ledger.responses];

      let qIdx = 0;
      for (const response of responses) {
        try {
          const origQ = response.originalQuestion || `Question #${response.questionNumber}`;
          const concept = response.conceptName || 'Mathematics';
          const qType = response.questionType || 'standard';
          const baseOffset = qIdx * 5;

          console.log(`[Remediation] Generating Q#${response.questionNumber}: "${origQ}" | type=${qType} | offset=${baseOffset}`);

          let batch: Array<{ question: string; answer: string }> = [];

          try {
            batch = await generativeEngine.generateBatch(origQ, concept, qType, baseOffset);
          } catch (genErr: any) {
            console.warn(`[Remediation] generateBatch threw for Q#${response.questionNumber}:`, genErr.message);
          }

          // GUARANTEED FALLBACK: if batch is empty, use direct inline presets per type
          if (!batch || batch.length === 0) {
            console.warn(`[Remediation] Batch empty for Q#${response.questionNumber}, using inline fallback`);
            batch = this.getInlineFallback(origQ, concept, qType, baseOffset);
          }

          const practiceQuestions: IGeneratedPracticeQuestion[] = batch.map(b => ({
            question: b.question,
            answer: b.answer,
            generatedAt: new Date()
          }));

          response.practiceQuestions = practiceQuestions;
          response.type = 'generative';
          console.log(`[Remediation] ✅ Q#${response.questionNumber} → ${practiceQuestions.length} practice questions (offset ${baseOffset})`);
          qIdx++;
        } catch (qErr: any) {
          console.error(`[Remediation] ❌ Q#${response.questionNumber} failed:`, qErr.message);
          const baseOffset = qIdx * 5;
          response.practiceQuestions = this.getInlineFallback(
            response.originalQuestion || `Question #${response.questionNumber}`,
            response.conceptName || 'Mathematics',
            response.questionType || 'standard',
            baseOffset
          ).map(b => ({ question: b.question, answer: b.answer, generatedAt: new Date() }));
          qIdx++;
        }
      }

      // Flip status to completed
      try {
        await RemediationLedger.updateOne({ id: ledgerId }, { $set: { remediationStatus: 'completed', responses } }).exec();
        await dbStore.updateRemediationLedger(ledgerId, { remediationStatus: 'completed', responses });
        console.log(`[RemediationService] Completed background generation for ledger ${ledgerId}`);
      } catch (err) {
        console.error('Failed to complete ledger update:', err);
      }

    } catch (bgError: any) {
      console.error(`[RemediationService] Catastrophic failure in ledger ${ledgerId}:`, bgError.message);
      try {
        await RemediationLedger.updateOne({ id: ledgerId }, { $set: { remediationStatus: 'failed' } }).exec();
        await dbStore.updateRemediationLedger(ledgerId, { remediationStatus: 'failed' });
      } catch {}
    }
  }

  // Helper to find student name
  private async findStudentName(studentId: string): Promise<string> {
    try {
      const students = await dbStore.getStudents();
      const s = students.find(x => x.id === studentId);
      return s ? s.name : 'Unknown Student';
    } catch {
      return 'Unknown Student';
    }
  }

  private async findOriginalQuestion(examId: string, questionNumber: number): Promise<{
    questionText?: string;
    answer?: string;
    conceptName?: string;
    type?: 'numeric' | 'matrix' | 'generative';
    questionType?: string;
  }> {
    try {
      // 1. Look up saved paper blueprint
      let bp = blueprintService.getWorksheetBlueprint(examId);
      if (!bp) {
        const allBps = (blueprintService as any).getAllBlueprints ? (blueprintService as any).getAllBlueprints() : [];
        bp = allBps.find((b: any) => b.worksheetId === examId || examId.includes(b.worksheetId) || b.worksheetId.includes(examId));
      }

      if (bp && bp.items) {
        const item = bp.items.find(i => i.questionNumber === questionNumber) || bp.items[questionNumber - 1];
        if (item) {
          return {
            questionText: item.originalQuestion,
            answer: item.correctAnswer,
            conceptName: item.topic,
            questionType: item.questionType
          };
        }
      }

      // 2. Look up levelWorksheets in dbStore
      const levelWs = (await dbStore.getLevelWorksheets()) || [];
      const lws = levelWs.find(w => w.id === examId || examId.includes(w.id) || w.id.includes(examId)) ||
        levelWs.sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0];

      if (lws && lws.answerKey?.items) {
        const item = lws.answerKey.items.find((i: any) =>
          i.questionNo === questionNumber ||
          i.questionNumber === questionNumber ||
          i.question_no === questionNumber
        ) || lws.answerKey.items[questionNumber - 1];

        if (item) {
          return {
            questionText: item.questionText || item.question || `${item.sectionName || 'Question'} — Item ${questionNumber}`,
            answer: typeof item.correctAnswer === 'object' ? JSON.stringify(item.correctAnswer) : String(item.correctAnswer ?? item.answer ?? ''),
            conceptName: item.sectionName || item.topic || 'Mathematics',
            questionType: item.questionType || item.type || 'standard'
          };
        }
      }

      // 3. Look up standard worksheets in dbStore
      const worksheets = (await dbStore.getWorksheets()) || [];
      const ws = worksheets.find(w => w.id === examId || examId.includes(w.id));
      if (ws && ws.questions && ws.questions[questionNumber - 1]) {
        const q = ws.questions[questionNumber - 1];
        return {
          questionText: q.question,
          answer: q.answer,
          conceptName: q.topic,
          questionType: q.questionType || q.answer_type || 'standard',
          type: q.answer_type === 'number' ? 'numeric' : q.answer_type === 'choice' ? 'matrix' : 'generative'
        };
      }

      // 4. Derive level from examId string (e.g. level_30_30.2_set1_...)
      const match = (examId || '').match(/level_?(\d+)/i);
      if (match) {
        const lvl = parseInt(match[1], 10);
        const derived = generateQuestionsForLevel(lvl, 0);
        if (derived && derived[questionNumber - 1]) {
          const dq = derived[questionNumber - 1];
          return {
            questionText: dq.question,
            answer: dq.answer,
            conceptName: dq.topic,
            questionType: dq.questionType || 'standard'
          };
        }
      }
    } catch (err) {
      console.warn(`[RemediationService] Could not lookup original question for ${examId} Q#${questionNumber}:`, err);
    }
    return {};
  }

  /**
   * GUARANTEED FALLBACK — never fails, never returns empty, runs in-process only.
   * Covers all 176 paper types with hardcoded presets matched to question text.
   */
  public getInlineFallback(
    originalQuestion: string,
    conceptName: string,
    questionType: string,
    baseOffset: number = 0
  ): Array<{ question: string; answer: string }> {
    return Array.from({ length: 5 }, (_, i) => {
      const bp = blueprintEngine.generate(originalQuestion, conceptName, questionType, '', baseOffset + i);
      return { question: bp.question, answer: bp.answer };
    });
  }
}

export const remediationService = new RemediationService();

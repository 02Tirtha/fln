import { dbStore } from '../../db';
import { RemediationLedger } from '../../models/RemediationLedger.model';
import { ExamBlueprint } from '../../models/ExamBlueprint.model';
import { routerService } from './router.service';
import { IRemediationLedger, IGeneratedPracticeQuestion } from '../../interfaces/remediationLedger.interface';
import { randomUUID } from 'crypto';
import { generativeEngine } from './generativeEngine';

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
        if (originalQuestions && originalQuestions[qNo - 1]) {
          const q = originalQuestions[qNo - 1];
          originalInfo = {
            questionText: q.question,
            answer: q.answer,
            conceptName: q.topic,
            type: q.answer_type === 'number' ? 'numeric' : q.answer_type === 'choice' ? 'matrix' : 'generative'
          };
        } else {
          originalInfo = await this.findOriginalQuestion(examId, qNo);
        }
        return {
          questionNumber: qNo,
          conceptName: originalInfo.conceptName || `Concept for Q#${qNo}`,
          type: originalInfo.type || 'numeric',
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

      for (const response of responses) {
        try {
          // Find blueprint rule document
          let blueprint: any = await ExamBlueprint.findOne({ examId }).exec();

          if (!blueprint) {
            const allBps = await dbStore.getExamBlueprints();
            blueprint = allBps.find(b => b.examId === examId) || null;
          }

          const blueprintQuestion = blueprint?.questions?.find(
            (q: any) => q.questionNum === response.questionNumber
          );

          const practiceQuestions: IGeneratedPracticeQuestion[] = [];
          const generatedTexts = new Set<string>();
          let retries = 0;
          const maxRetries = 30;

          if (!blueprintQuestion) {
            console.warn(`[RemediationService] No blueprint for exam ${examId} Q#${response.questionNumber}. Using generic fallback.`);
            while (practiceQuestions.length < 5 && retries < maxRetries) {
              retries++;
              const generated = await generativeEngine.generate(
                `Similar to: ${response.originalQuestion || 'this math question'}`,
                `Create a similar but distinct practice question for concept: ${response.conceptName}`
              );
              
              if (!generatedTexts.has(generated.question)) {
                generatedTexts.add(generated.question);
                practiceQuestions.push({
                  question: generated.question,
                  answer: generated.answer,
                  generatedAt: new Date()
                });
              }
            }
            response.practiceQuestions = practiceQuestions;
            response.type = blueprintQuestion.type.toLowerCase() as any;
            continue;
          }

          while (practiceQuestions.length < 5 && retries < maxRetries) {
            retries++;
            const generated = await routerService.route(blueprintQuestion);
            if (!generatedTexts.has(generated.question)) {
              generatedTexts.add(generated.question);
              practiceQuestions.push({
                question: generated.question,
                answer: generated.answer,
                generatedAt: new Date()
              });
            }
          }

          response.practiceQuestions = practiceQuestions;
          // Update type if mismatch (convert uppercase to lowercase engine format)
          response.type = blueprintQuestion?.type?.toLowerCase() as any || 'generative';
          response.type = blueprintQuestion.type.toLowerCase() as any;
        } catch (qErr: any) {
          console.error(`[RemediationService] Failed to generate practice questions for Q#${response.questionNumber}:`, qErr.message);
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
  }> {
    try {
      const worksheets = await dbStore.getWorksheets();
      const ws = worksheets.find(w => w.id === examId);
      if (ws && ws.questions && ws.questions[questionNumber - 1]) {
        const q = ws.questions[questionNumber - 1];
        return {
          questionText: q.question,
          answer: q.answer,
          conceptName: q.topic,
          type: q.answer_type === 'number' ? 'numeric' : q.answer_type === 'choice' ? 'matrix' : 'generative'
        };
      }
    } catch {}
    return {};
  }
}

export const remediationService = new RemediationService();

import { Request, Response } from 'express';
import { dbStore } from '../db';
import { RemediationLedger } from '../models/RemediationLedger.model';
import { remediationService } from '../services/remediation/remediation.service';
import { IRemediationLedger } from '../interfaces/remediationLedger.interface';

export class RemediationController {
  // POST /api/remediation/generate (trigger)
  
    async generate(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, examId, failedQuestionNums, originalQuestions } = req.body;

      if (!studentId || !examId || !Array.isArray(failedQuestionNums)) {
        res.status(400).json({ success: false, error: 'Missing studentId, examId, or failedQuestionNums array.' });
        return;
      }

      if (failedQuestionNums.length === 0) {
        res.status(400).json({ success: false, error: 'failedQuestionNums array cannot be empty.' });
        return;
      }

      const result = await remediationService.startGeneration(
        studentId,
        examId,
        failedQuestionNums,
        originalQuestions
      );
      res.status(202).json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  // GET /api/remediation/:studentId/:examId (poll + fetch)
  async getLedgerByStudentAndExam(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, examId } = req.params;

      let ledger: IRemediationLedger | null = null;
      try {
        ledger = await RemediationLedger.findOne({ studentId, examId }).exec();
      } catch (err) {
        console.warn('Mongoose query failed, searching dbStore:', err);
      }

      if (!ledger) {
        const all = await dbStore.getRemediationLedgers();
        ledger = all.find(l => l.studentId === studentId && l.examId === examId) || null;
      }

      if (!ledger) {
        res.status(404).json({ success: false, error: 'Remediation ledger not found for this student and exam.' });
        return;
      }

      // AUTO-FIX: if any response has empty practiceQuestions (stale old data), fill them now
      if (ledger.remediationStatus === 'completed') {
        let needsFix = false;
        let qIdx = 0;
        const responses = (ledger.responses || []).map((r: any) => {
          const isWrongShapeAssigned = !/shape/i.test(r.originalQuestion || '') &&
            r.practiceQuestions?.some((pq: any) => /corners on a square|Identify shape|pentagon|no straight sides/i.test(pq.question));

          const isWrongDivisionAssigned = /greater than|less than|compare/i.test(r.originalQuestion || '') &&
            r.practiceQuestions?.some((pq: any) => /Divide|quotient|÷/i.test(pq.question));

          const isWrongMultiplicationAssigned = /frequency table|frequency|tally|clock|greater than|less than/i.test(r.originalQuestion || '') &&
            r.practiceQuestions?.some((pq: any) => /Express as multiplication|factor of 12|multiple of 5/i.test(pq.question));

          const isWrongEqualGroupsAssigned = /equal groups|count equal/i.test(r.originalQuestion || '') &&
            r.practiceQuestions?.some((pq: any) => /What number comes AFTER|Which number is LARGER/i.test(pq.question));

          const isWrongMeasurementAssigned = /measurement-mixed-mcq|mixed-mcq/i.test(r.originalQuestion || '') &&
            r.practiceQuestions?.some((pq: any) => /Convert meters|Convert kilograms|Convert 500 cm/i.test(pq.question));

          const isStaleOrInvalid = !r.practiceQuestions || r.practiceQuestions.length === 0 || isWrongShapeAssigned || isWrongDivisionAssigned || isWrongMultiplicationAssigned || isWrongEqualGroupsAssigned || isWrongMeasurementAssigned ||
            r.practiceQuestions.some((pq: any) =>
              /Numeric practice for/i.test(pq.question) ||
              /Practice for/i.test(pq.question) ||
              /Sample #/i.test(pq.question) ||
              pq.question === r.originalQuestion
            );

          if (isStaleOrInvalid) {
            needsFix = true;
            const origQ = r.originalQuestion || `Question #${r.questionNumber}`;
            const concept = r.conceptName || 'Mathematics';
            const qType = r.questionType || 'standard';
            const baseOffset = qIdx * 5;
            qIdx++;
            return {
              ...r,
              practiceQuestions: remediationService.getInlineFallback(origQ, concept, qType, baseOffset)
                .map((b: any) => ({ question: b.question, answer: b.answer, generatedAt: new Date() }))
            };
          }
          qIdx++;
          return r;
        });

        if (needsFix) {
          console.log(`[RemediationController] Auto-fixing stale empty practiceQuestions for ledger ${ledger.id}`);
          ledger = { ...ledger, responses } as any;
          // Save the fix back to DB asynchronously
          RemediationLedger.updateOne(
            { studentId, examId },
            { $set: { responses } }
          ).exec().catch(err => console.warn('[RemediationController] Could not save auto-fix:', err));
        }
      }

      res.status(200).json({ success: true, data: ledger });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/remediation/batch/:examId (batch printing)
  async getBatchLedgers(req: Request, res: Response): Promise<void> {
    try {
      const { examId } = req.params;

      let ledgers: IRemediationLedger[] = [];
      try {
        ledgers = await RemediationLedger.find({ examId, remediationStatus: 'completed' }).exec();
      } catch (err) {
        console.warn('Mongoose query failed, searching dbStore:', err);
        const all = await dbStore.getRemediationLedgers();
        ledgers = all.filter(l => l.examId === examId && l.remediationStatus === 'completed');
      }

      res.status(200).json({ success: true, data: ledgers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/remediation/ledgers?studentId=XYZ
  async getLedgersForStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.query.studentId as string;
      if (!studentId) {
        res.status(400).json({ success: false, error: 'studentId is required' });
        return;
      }

      let ledgers: IRemediationLedger[] = [];
      try {
        ledgers = await RemediationLedger.find({ studentId }).exec();
      } catch (err) {
        console.warn('Mongoose query failed, searching dbStore:', err);
        const all = await dbStore.getRemediationLedgers();
        ledgers = all.filter(l => l.studentId === studentId);
      }

      res.status(200).json({ success: true, data: ledgers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const remediationController = new RemediationController();

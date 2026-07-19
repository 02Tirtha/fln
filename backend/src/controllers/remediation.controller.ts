import { Request, Response } from 'express';
import { dbStore } from '../db';
import { RemediationLedger } from '../models/RemediationLedger.model';
import { remediationService } from '../services/remediation/remediation.service';
import { IRemediationLedger } from '../interfaces/remediationLedger.interface';

export class RemediationController {
  // POST /api/remediation/generate (trigger)
  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, examId, failedQuestionNums } = req.body;

      if (!studentId || !examId || !Array.isArray(failedQuestionNums)) {
        res.status(400).json({ success: false, error: 'Missing studentId, examId, or failedQuestionNums array.' });
        return;
      }

      if (failedQuestionNums.length === 0) {
        res.status(400).json({ success: false, error: 'failedQuestionNums array cannot be empty.' });
        return;
      }

      const result = await remediationService.startGeneration(studentId, examId, failedQuestionNums);
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

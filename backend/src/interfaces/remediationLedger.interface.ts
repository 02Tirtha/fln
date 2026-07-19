import { Document } from 'mongoose';

export interface IGeneratedPracticeQuestion {
  question: string;
  answer: string;
  generatedAt?: Date;
}

export interface IRemediationResponse {
  questionNumber: number;
  conceptName: string;
  type: 'numeric' | 'matrix' | 'generative';
  originalQuestion: string;
  originalAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  practiceQuestions?: IGeneratedPracticeQuestion[];
}

export interface IRemediationLedger {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  worksheetId: string;
  score: number;
  totalQuestions: number;
  remediationStatus: 'pending' | 'generating' | 'completed' | 'failed' | 'not_needed';
  responses: IRemediationResponse[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRemediationLedgerDocument extends Omit<IRemediationLedger, 'id'>, Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

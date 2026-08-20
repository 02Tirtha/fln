// Extracted from frontend/src/components/PanelViews.tsx (issue #144, PR 2).
import React from 'react';
import { PageHeader } from './PanelShared';
import { FileText } from 'lucide-react';

const DIAGNOSTIC_HISTORY = [
  { id: 'dh1', student: 'Amanpreet Singh', date: '2026-03-15', score: 8, total: 10, placedLevel: 12, evaluator: 'Ritu Sharma' },
  { id: 'dh2', student: 'Rohit Kumar', date: '2026-01-10', score: 9, total: 10, placedLevel: 36, evaluator: 'Ritu Sharma' },
  { id: 'dh3', student: 'Arjun Verma', date: '2026-04-01', score: 6, total: 10, placedLevel: 6, evaluator: 'Amit Kumar' },
  { id: 'dh4', student: 'Neha Gupta', date: '2026-03-01', score: 7, total: 10, placedLevel: 38, evaluator: 'Ritu Sharma' },
  { id: 'dh5', student: 'Jasmine Kaur', date: '2026-02-20', score: 5, total: 10, placedLevel: 8, evaluator: 'Amit Kumar' },
];

export const TestHistoryPanel: React.FC = () => {
  return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-4">
        <PageHeader title="Test History" desc="Complete record of all diagnostic and worksheet evaluations" icon={<FileText className="h-5 w-5" />} />
        <div className="space-y-3">{DIAGNOSTIC_HISTORY.map(h => (
          <div key={h.id} className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <div><div className="font-semibold text-sm">{h.student}</div><div className="text-xs text-slate-400 dark:text-slate-500">{h.date} · Evaluated by {h.evaluator}</div></div>
            <div className="text-right"><div className="font-mono font-bold">{h.score}/{h.total}</div><div className="text-xs text-slate-400 dark:text-slate-500">Placed L{h.placedLevel}</div></div>
          </div>
        ))}</div>
      </div>
  );
};

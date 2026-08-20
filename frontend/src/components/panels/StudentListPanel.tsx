// Extracted from frontend/src/components/PanelViews.tsx (issue #144, PR 3).
import React from 'react';
import { Student } from '../../types';
import { PageHeader, EmptyStudents } from './PanelShared';
import { Users } from 'lucide-react';

export const StudentListPanel: React.FC<{ students: Student[] }> = ({ students }) => {
  return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-4">
        <PageHeader title="Student Roster" desc="Complete list of registered students across your classes" icon={<Users className="h-5 w-5" />} />
        <EmptyStudents students={students} />
      </div>
  );
};

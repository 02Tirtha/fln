// Extracted from frontend/src/components/PanelViews.tsx (issue #144, PR 7).
// Internally role-branches: State Admin gets a district drill-down
// sub-view, every other role gets the flat evaluation-list view.
import React, { useState, useEffect } from 'react';
import { User, UserRole, School, Student, EvaluationReport } from '../../types';
import { PageHeader } from './PanelShared';
import { MetricCard } from '../Card';
import { handleDownloadPDF } from './pdfReportGenerator';
import { FileText, BarChart3, School as SchoolIcon, MapPin, ChevronDown, Award } from 'lucide-react';
import { DISTRICT_NAMES } from '../../constants';

export const ReportsPanel: React.FC<{
  currentUser: User;
  schools: School[];
  students: Student[];
  reportsList: EvaluationReport[];
  token: string;
}> = ({ currentUser, schools, students, reportsList, token }) => {
  const [expandedDistRpt, setExpandedDistRpt] = useState<string | null>(null);
  const [remediationLedgers, setRemediationLedgers] = useState<any[]>([]);

  const fetchLedgers = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/remediation/ledgers', { headers });
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        setRemediationLedgers(d.data);
      }
    } catch (err) {
      console.error('Failed to fetch remediation ledgers:', err);
    }
  };

  useEffect(() => {
    fetchLedgers();
    // Poll ledgers every 5 seconds if there are pending/generating ones
    const interval = setInterval(() => {
      fetchLedgers();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleViewRemediationNotes = (studentName: string, studentId: string, examId: string) => {
    const nameQuery = studentName ? `?studentName=${encodeURIComponent(studentName)}` : '';
    window.open(`/remediation-note/${studentId}/${encodeURIComponent(String(examId))}${nameQuery}`, '_blank');
  };

  const handleRequestRemediation = async (student: Student, report: EvaluationReport, examResponses: any[]) => {
    // 1. Immediately open the remediation notes view so the user doesn't wait
    handleViewRemediationNotes(student.name, student.id, report.worksheetId);

    // 2. Fire the background trigger request
    const failedQuestionNums: number[] = [];
    (examResponses || []).forEach((r: any, idx: number) => {
      if (r.status === 'Incorrect' || r.isCorrect === false) {
        failedQuestionNums.push(idx + 1);
      }
    });

    if (failedQuestionNums.length === 0) {
      for (let i = 1; i <= report.totalQuestions; i++) {
        failedQuestionNums.push(i);
      }
    }

    try {
      const res = await fetch('/api/remediation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: student.id,
          examId: report.worksheetId,
          failedQuestionNums,
          questions: (report as any).questions || []
        })
      });
      const d = await res.json();
      if (d.success) {
        fetchLedgers();
      } else {
        console.warn('Remediation trigger warning:', d.error);
      }
    } catch (err) {
      console.error('Background remediation generate error:', err);
    }
  };

  const handlePrintRemediationSlip = (student: Student, ledger: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the remediation slip.');
      return;
    }

    const failedResponses = (ledger.responses || []).filter((r: any) => !r.isCorrect);

    const renderPracticeQuestions = (practiceQs: any[], conceptIdx: number) => {
      return practiceQs.map((pq: any, qIdx: number) => {
        if (pq.subQuestions && Array.isArray(pq.subQuestions) && pq.subQuestions.length > 0) {
          const instruction = pq.question || pq.topic || 'Practice Questions';
          const subQs = pq.subQuestions.map((sq: any, sqIdx: number) => {
            const prompt = sq.prompt || sq.question || '';
            return `
              <div class="sub-question" style="margin-bottom: 14px; padding-left: 16px;">
                <div class="sub-q-text" style="font-size: 13px; color: #1e293b; margin-bottom: 4px;">
                  <strong style="color: #374151;">Q${sqIdx + 1}.</strong> ${prompt}
                </div>
                <div class="answer-line" style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px; height: 24px;">
                  Answer: __________________________________
                </div>
              </div>
            `;
          }).join('');
          return `
            <div class="concept-block" style="margin-bottom: 24px; page-break-inside: avoid;">
              <div class="instruction-header" style="font-size: 14px; font-weight: 700; color: #1e3a8a; margin-bottom: 12px; padding: 10px 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0;">
                ${instruction}
              </div>
              <div class="sub-questions">
                ${subQs}
              </div>
            </div>
          `;
        }
        return `
          <div class="question-item" style="margin-bottom: 18px; padding-left: 12px;">
            <div class="question-text" style="font-size: 13px; color: #1e293b; margin-bottom: 6px;">
              <strong>Q${qIdx + 1}.</strong> ${pq.question}
            </div>
            <div class="answer-space" style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px; height: 24px;">
              Answer: __________________________________
            </div>
          </div>
        `;
      }).join('');
    };

    const renderAnswerKey = (practiceQs: any[], conceptName: string) => {
      return practiceQs.map((pq: any, qIdx: number) => {
        if (pq.subQuestions && Array.isArray(pq.subQuestions) && pq.subQuestions.length > 0) {
          const answers = pq.subQuestions.map((sq: any, sqIdx: number) => {
            const answer = sq.answer || '';
            return `<span style="margin-right: 16px;"><strong>Q${sqIdx + 1}:</strong> ${answer}</span>`;
          }).join('');
          return `
            <div style="margin-bottom: 10px; font-size: 11px;">
              <strong>${conceptName}</strong> (Instruction: ${pq.question || pq.topic || ''})<br/>
              ${answers}
            </div>
          `;
        }
        return `<div style="margin-bottom: 6px; font-size: 11px;"><strong>Q${qIdx + 1}:</strong> ${pq.answer}</div>`;
      }).join('');
    };

    const questionsHtml = failedResponses.map((r: any, idx: number) => {
      const practiceQs = r.practiceQuestions || [];
      const questionsList = renderPracticeQuestions(practiceQs, idx);
      return `
        <div class="concept-section" style="margin-bottom: 30px; page-break-inside: avoid;">
          <div class="concept-header" style="font-size: 13px; font-weight: 700; background-color: #f1f5f9; padding: 8px 12px; border-left: 4px solid #4f46e5; border-radius: 0 6px 6px 0; color: #0f172a; margin-bottom: 10px;">
            Concept ${idx + 1}: ${r.conceptName}
          </div>
          <div class="original-box" style="font-size: 11px; color: #64748b; margin-bottom: 15px; padding: 0 12px; font-style: italic;">
            <strong>Original Question (Incorrect):</strong> "${r.originalQuestion}"
          </div>
          <div class="practice-list">
            ${questionsList || '<p style="color:#ef4444; font-size:12px;">No practice questions generated for this concept.</p>'}
          </div>
        </div>
      `;
    }).join('');

    const answerKeyHtml = failedResponses.map((r: any) => {
      const practiceQs = r.practiceQuestions || [];
      return renderAnswerKey(practiceQs, r.conceptName);
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remediation Slip - ${student.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 25px; }
          .title { font-size: 22px; font-weight: 700; color: #4f46e5; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 5px; font-weight: 600; letter-spacing: 0.5px; }
          .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; }
          .info-item { font-size: 13px; }
          .info-item strong { color: #0f172a; }
          .concept-section { margin-bottom: 30px; page-break-inside: avoid; }
          .concept-header { font-size: 13px; font-weight: 700; background-color: #f1f5f9; padding: 8px 12px; border-left: 4px solid #4f46e5; border-radius: 0 6px 6px 0; color: #0f172a; margin-bottom: 10px; }
          .original-box { font-size: 11px; color: #64748b; margin-bottom: 15px; padding: 0 12px; font-style: italic; }
          .question-item { margin-bottom: 18px; padding-left: 12px; }
          .question-text { font-size: 13px; color: #1e293b; margin-bottom: 6px; }
          .answer-space { font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px; height: 24px; }
          .answer-line { font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px; height: 24px; }
          .sub-q-text { font-size: 13px; color: #1e293b; margin-bottom: 4px; }
          .instruction-header { font-size: 14px; font-weight: 700; color: #1e3a8a; margin-bottom: 12px; padding: 10px 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; }
          .answer-key-section { margin-top: 50px; border-top: 2px dashed #cbd5e1; padding-top: 20px; page-break-inside: avoid; }
          .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @media print {
            body { padding: 20px; }
            .concept-section, .concept-block { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Remediation Practice Slip</div>
          <div class="subtitle">Targeted Practice Worksheet for Learning Gaps</div>
        </div>

        <div class="student-info">
          <div class="info-item">Student Name: <strong>${student.name}</strong></div>
          <div class="info-item">Student ID: <strong>${student.id}</strong></div>
          <div class="info-item">Class / Section: <strong>${student.classGroup} - ${student.section}</strong></div>
          <div class="info-item">Exam ID: <strong>${ledger.examId}</strong></div>
        </div>

        <div class="section-title" style="font-weight: 700; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; color: #0f172a;">Targeted Practice Exercises</div>

        ${questionsHtml}

        <div class="answer-key-section">
          <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 15px; color: #475569; letter-spacing: 0.5px;">Teacher Answer Key (For Grading Reference Only)</div>
          ${answerKeyHtml || '<p style="font-size:11px; color:#64748b;">No keys registered.</p>'}
        </div>

        <div class="footer">
          Confidential Remediation Record · Generated by FLN Portal.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

    const isStateAdmin = currentUser.role === UserRole.ADMIN;
    if (isStateAdmin) {
      const userState = currentUser.stateCode || 'PB';
      const stateSchools = schools.filter(s => s.stateCode === userState);
      const stateDistricts = Array.from(new Set(stateSchools.map(s => s.districtCode))) as string[];
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard title="Total Reports" value={reportsList.length} subtext="All evaluations" icon={FileText} />
            <MetricCard title="Avg Score" value={reportsList.length > 0 ? `${Math.round(reportsList.reduce((a, r) => a + (r.score / r.totalQuestions) * 100, 0) / reportsList.length)}%` : '—'} subtext="Across reports" icon={BarChart3} />
            <MetricCard title="Schools" value={stateSchools.length} subtext={`In ${userState}`} icon={SchoolIcon} />
            <MetricCard title="Districts" value={stateDistricts.length} subtext="Active jurisdictions" icon={MapPin} />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <PageHeader title={`District-Wise School Reports — ${userState}`} desc="Evaluation reports organized by district and school" />
            <div className="space-y-3 mt-4">{stateDistricts.map(dc => {
              const isExpanded = expandedDistRpt === dc;
              const distSchools = stateSchools.filter(s => s.districtCode === dc);
              return (
                <div key={dc}>
                  <button onClick={() => setExpandedDistRpt(isExpanded ? null : dc)} className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${isExpanded ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-100 dark:border-slate-700'}`}>
                    <span className="font-bold text-sm w-16">{dc}</span>
                    <span className="text-sm flex-1">{DISTRICT_NAMES[dc] || dc}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{distSchools.length} schools</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-6 mt-2 space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                      {distSchools.map(sch => {
                        const schStudents = students.filter(st => st.schoolId === sch.id);
                        const schReports = reportsList.filter(r => schStudents.some(st => st.id === r.studentId));
                        const avgScore = schReports.length > 0 ? Math.round(schReports.reduce((a, r) => a + (r.score / r.totalQuestions) * 100, 0) / schReports.length) : 0;
                        return (
                          <div key={sch.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3"><h4 className="font-bold text-slate-900 dark:text-white text-sm">{sch.name}</h4><span className="text-xs text-slate-400 dark:text-slate-500">{sch.blockCode} · {sch.strength}</span></div>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2"><div className="text-lg font-bold text-slate-900 dark:text-white">{schReports.length}</div><div className="text-[10px] text-slate-400 dark:text-slate-500">Reports</div></div>
                              <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2"><div className={`text-lg font-bold ${avgScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{avgScore}%</div><div className="text-[10px] text-slate-400 dark:text-slate-500">Avg Score</div></div>
                              <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2"><div className="text-lg font-bold text-slate-900 dark:text-white">{schStudents.length}</div><div className="text-[10px] text-slate-400 dark:text-slate-500">Students</div></div>
                            </div>
                            {schReports.length > 0 ? (
                              <div className="space-y-2">{schReports.map(r => {
                                const student = schStudents.find(st => st.id === r.studentId);
                                const scorePct = Math.round((r.score / r.totalQuestions) * 100);
                                return (
                                  <div key={r.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 text-sm">
                                    <div className="flex justify-between items-center"><span className="font-semibold">{student?.name || 'N/A'}</span><span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${scorePct >= 80 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : scorePct >= 60 ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>{r.score}/{r.totalQuestions} ({scorePct}%)</span></div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{r.narrative}</p>
                                    <div className="flex gap-1 mt-1.5">{Object.entries(r.conceptMastery).map(([t, m]) => (
                                      <span key={t} className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${m === 'Strong' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : m === 'Satisfactory' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>{t}</span>
                                    ))}</div>
                                  </div>
                                );
                              })}</div>
                            ) : <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">No evaluation reports for this school yet.</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Total Reports" value={reportsList.length} subtext="All evaluations" icon={FileText} />
          <MetricCard title="Avg Score" value={reportsList.length > 0 ? `${Math.round(reportsList.reduce((a, r) => a + (r.score / r.totalQuestions) * 100, 0) / reportsList.length)}%` : '—'} subtext="Across reports" icon={BarChart3} />
          <MetricCard title="Strong Concepts" value={reportsList.reduce((a, r) => a + Object.values(r.conceptMastery).filter(v => v === 'Strong').length, 0)} subtext="Mastered topics" icon={Award} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-4">
          <PageHeader title="Evaluation Reports" desc="Detailed assessment narratives and concept mastery breakdowns" />
          {reportsList.map(r => {
            const student = students.find(s => s.id === r.studentId);

            return (
              <div key={r.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                <div className="flex justify-between items-center"><span className="font-semibold text-sm">{student?.name || 'Unknown'}</span><span className="text-xs text-slate-400 dark:text-slate-500">{new Date(r.timestamp).toLocaleDateString()}</span></div>
                <div className="flex gap-4 text-sm"><span>Score: <strong>{r.score}/{r.totalQuestions}</strong></span><span>Level: <strong>L{r.recommendedLevel}.{r.recommendedSubLevel ?? 0}</strong></span></div>
                
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Evaluation Report Narrative</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-line">{r.narrative}</p>
                </div>

                <div className="flex flex-wrap gap-2">{Object.entries(r.conceptMastery).map(([t, m]) => (
                  <span key={t} className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${m === 'Strong' ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : m === 'Satisfactory' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>{t}: {m}</span>
                ))}</div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {student && (() => {
                      const scorePct = Math.round((r.score / r.totalQuestions) * 100);
                      const ledger = remediationLedgers.find(l => l.examId === r.worksheetId && l.studentId === r.studentId);
                      if (scorePct >= 100) {
                        return <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">100% Mastery - No Remediation Needed</span>;
                      }
                      if (!ledger) {
                        return (
                          <button
                            onClick={() => handleRequestRemediation(student, r, r.responses || [])}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-205 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            📝 Generate Remediation Sheet
                          </button>
                        );
                      }
                      if (ledger.remediationStatus === 'generating' || ledger.remediationStatus === 'pending') {
                        return (
                          <span className="px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-205 text-xs font-semibold animate-pulse flex items-center gap-1">
                            ⏳ Generating Practice...
                          </span>
                        );
                      }
                      if (ledger.remediationStatus === 'failed') {
                        return (
                          <button
                            onClick={() => handleRequestRemediation(student, r, r.responses || [])}
                            className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-750 border border-red-205 text-xs font-semibold cursor-pointer"
                          >
                            ⚠️ Retry Remediation
                          </button>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewRemediationNotes(student.name, student.id, r.worksheetId)}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-205 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            📝 View Remediation Sheet
                          </button>
                          <button
                            onClick={() => handlePrintRemediationSlip(student, ledger)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-205 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            🖨️ Print Slip
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                  {student && (
                    <button onClick={() => handleDownloadPDF(student, r)} className="text-xs font-semibold text-emerald-650 hover:text-emerald-800 flex items-center gap-1 cursor-pointer">
                      📥 Download PDF Report
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
};

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { buildUrl } from '../utils/apiBase';

interface RemediationResponse {
  questionNumber: number;
  conceptName: string;
  originalQuestion: string;
  isCorrect: boolean;
  practiceQuestions?: Array<{
    question: string;
    answer?: string;
  }>;
}

interface RemediationLedger {
  studentId: string;
  examId: string;
  studentName?: string;
  remediationStatus: string;
  generatedAt?: string;
  notes?: string;
  responses?: RemediationResponse[];
}

export const RemediationNotesView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId, examId } = useParams<{ studentId: string; examId: string }>();
  const [ledger, setLedger] = useState<RemediationLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = new URLSearchParams(location.search);
  const studentNameFromQuery = query.get('studentName') || undefined;

  // POLL LOGIC: Yeh function baar-baar call hoga jab tak status 'generating' hai
  const fetchLedger = async (isPolling: boolean = false) => {
    if (!studentId || !examId) return;

    const token = localStorage.getItem('fln_token') || '';
    try {
      const res = await fetch(buildUrl(`/api/remediation/${studentId}/${examId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Network response failed');
      const data = await res.json();
      
      const currentLedger = data.data;
      setLedger(currentLedger);
      
      // Agar generating hai, toh 'loading' ko true hi rakho taaki UI update hota rahe
      if (currentLedger?.remediationStatus === 'generating') {
        setLoading(true);
      } else {
        setLoading(false);
      }
    } catch (err) {
      if (!isPolling) setError('Failed to load remediation note.');
    }
  };

  useEffect(() => {
    fetchLedger(false);
    
    // Polling interval: Har 3 seconds mein status check karega
    const interval = setInterval(() => {
      if (ledger?.remediationStatus === 'generating') {
        fetchLedger(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [studentId, examId, ledger?.remediationStatus]);
  const handlePrint = () => {
    if (!ledger) return;

    const nameToShow = ledger.studentName || studentNameFromQuery || studentId || 'Student';
    const rows = (ledger.responses || [])
      .map(
        (response) => `
        <tr>
          <td style="padding:10px;border:1px solid #d1d5db;">${response.questionNumber}</td>
          <td style="padding:10px;border:1px solid #d1d5db;">${response.conceptName}</td>
          <td style="padding:10px;border:1px solid #d1d5db;">${response.originalQuestion}</td>
          <td style="padding:10px;border:1px solid #d1d5db;">${response.isCorrect ? 'Correct' : 'Incorrect'}</td>
        </tr>`
      )
      .join('');

    const practiceSections = (ledger.responses || [])
      .map(
        (response, index) => `
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 8px 0;font-size:14px;color:#111827;">Failed concept ${index + 1}: ${response.conceptName}</h3>
          <p style="margin:0 0 8px 0;font-size:13px;color:#374151;">Original question: ${response.originalQuestion}</p>
          <ol style="margin:0;padding-left:20px;font-size:13px;color:#374151;">
            ${response.practiceQuestions?.map((pq) => `<li style="margin-bottom:6px;">${pq.question}</li>`).join('') || '<li>No practice questions available.</li>'}
          </ol>
        </div>`
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Remediation Note - ${nameToShow}</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827; padding:24px; line-height:1.5; }
          .header { margin-bottom:24px; }
          .title { font-size:24px; font-weight:700; margin:0; }
          .subtitle { font-size:14px; color:#4b5563; margin-top:8px; }
          .meta { margin-top:18px; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; }
          .meta-card { background:#f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:14px; }
          .meta-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#6b7280; margin-bottom:6px; }
          .meta-value { font-size:13px; font-weight:600; color:#111827; }
          .section-title { margin-top:28px; font-size:14px; font-weight:700; color:#111827; border-left:4px solid #4f46e5; padding-left:12px; }
          .notes-box { margin-top:14px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:18px; white-space:pre-wrap; font-size:13px; color:#374151; }
          table { width:100%; border-collapse:collapse; margin-top:18px; font-size:13px; }
          th, td { border:1px solid #d1d5db; padding:10px; text-align:left; }
          th { background:#f1f5f9; color:#334155; font-weight:700; }
          .footer { margin-top:32px; font-size:11px; color:#6b7280; border-top:1px solid #e5e7eb; padding-top:14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Remediation Note</div>
          <div class="subtitle">Targeted practice and corrective actions for the student</div>
          <div class="meta">
            <div class="meta-card"><div class="meta-label">Student</div><div class="meta-value">${nameToShow}</div></div>
            <div class="meta-card"><div class="meta-label">Student ID</div><div class="meta-value">${studentId || 'N/A'}</div></div>
            <div class="meta-card"><div class="meta-label">Exam ID</div><div class="meta-value">${examId || 'N/A'}</div></div>
          </div>
        </div>

        ${ledger.notes ? `<div class="section-title">Remediation Summary</div><div class="notes-box">${ledger.notes}</div>` : ''}

        <div class="section-title">Failed Concepts & Practice Questions</div>
        ${practiceSections || '<p style="color:#6b7280;font-size:13px;margin-top:12px;">No remediation responses are available.</p>'}

        <div class="footer">Generated by the FLN Portal. Confidential student remediation note.</div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.alert('Please allow popups to print the remediation note.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Remediation Note</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Printable remediation note for the selected student exam.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              Loading remediation note...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
              {error}
            </div>
          ) : !ledger ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              No remediation note was found for this student and exam.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Student</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{ledger.studentName || studentNameFromQuery || studentId}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Student ID</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{studentId}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Exam ID</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{examId}</div>
                </div>
              </div>

              {ledger.notes && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Remediation Summary</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">{ledger.notes}</p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Failed Concepts & Practice</h2>
                <div className="mt-4 space-y-4">
                  {(ledger.responses || []).length > 0 ? (
                    ledger.responses.map((response, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Failed Concept
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                              {response.conceptName}
                            </div>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-[11px] font-semibold ${response.isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
                            {response.isCorrect ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                          <div className="font-semibold">Original Question</div>
                          <p className="mt-1">{response.originalQuestion}</p>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Practice Questions</div>
                          <ol className="mt-2 space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                            {response.practiceQuestions && response.practiceQuestions.length > 0 ? (
                              response.practiceQuestions.map((pq, pqIndex) => (
                            <li key={pqIndex}>
                              {pq.question.replace(/\s*\(Class\s+\d+\s+Diagnostic\)/gi, "")}
                            </li>                              
                          ))
                            ) : (
                              <li className="text-slate-500 dark:text-slate-400">No practice questions generated.</li>
                            )}
                          </ol>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No failed concept details are available.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                >
                  Back to Report
                </button>
                <button
                  onClick={handlePrint}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Print Remediation Note
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
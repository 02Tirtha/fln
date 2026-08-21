import { apiFetch } from '../services/apiClient';
import React, { useState, useEffect } from 'react';
import { User, UserRole, Student, ClassGroup, School, EvaluationReport, LogEntry, Ticket } from '../types';
import { usePanelData } from './panels/usePanelData';
import { AdaptiveTestPanel } from './panels/AdaptiveTestPanel';
import { TestHistoryPanel } from './panels/TestHistoryPanel';
import { WorksheetTemplatesPanel } from './panels/WorksheetTemplatesPanel';
import { SystemSettingsPanel } from './panels/SystemSettingsPanel';
import { StudentListPanel } from './panels/StudentListPanel';
import { DiagnosticTestPanel } from './panels/DiagnosticTestPanel';
import { PerformancePanel } from './panels/PerformancePanel';
import { WorksheetsPanel } from './panels/WorksheetsPanel';
import { AssignedSchoolsPanel } from './panels/AssignedSchoolsPanel';
import { StudentProgressPanel } from './panels/StudentProgressPanel';
import { AttendancePanel } from './panels/AttendancePanel';
import { TeachersPanel } from './panels/TeachersPanel';
import { SchoolsPanel } from './panels/SchoolsPanel';
import { UsersPanel } from './panels/UsersPanel';
import { ContentPanel } from './panels/ContentPanel';
import { DistrictsPanel } from './panels/DistrictsPanel';
import { BlocksPanel } from './panels/BlocksPanel';
import { AnalyticsPanel } from './panels/AnalyticsPanel';
import { ReportsPanel } from './panels/ReportsPanel';
import { StudentProfilePanel } from './panels/StudentProfilePanel';
import { Users, ShieldAlert, BookOpen, Calendar, ArrowRight, CheckCircle2, XCircle, SlidersHorizontal, Layers, Award, MapPin, School as SchoolIcon, BarChart3, FileText, ClipboardList, Building2, GraduationCap, BookMarked, Globe, Settings, Database, RefreshCw, Search, ChevronDown } from 'lucide-react';
import { Table, Column } from './Table';
import { MetricCard } from './Card';
import { STATE_NAMES, DISTRICT_NAMES, BLOCK_NAMES } from '../constants';
import { FLN_LEVELS_LIST } from './RoleDashboards';
import { ReasoningSection } from './EducationalReasoning';

interface PanelViewsProps {
  activePanel: string;
  currentUser: User;
  token: string;
}

const CONTENT_ITEMS = [
  { id: 'c1', title: 'Number Line 1-10', type: 'Visual Aid', level: 'L1-L4', language: 'English, Punjabi', status: 'Approved' },
  { id: 'c2', title: 'Addition with Objects', type: 'Lesson Plan', level: 'L7-L12', language: 'English, Hindi', status: 'Approved' },
  { id: 'c3', title: 'Place Value Chart', type: 'Poster', level: 'L24-L30', language: 'English, Punjabi', status: 'Draft' },
  { id: 'c4', title: 'Multiplication Tables Song', type: 'Audio', level: 'L36-L41', language: 'English', status: 'Review' },
  { id: 'c5', title: 'Fraction Pizza Activity', type: 'Worksheet', level: 'L45-L48', language: 'English, Hindi', status: 'Approved' },
  { id: 'c6', title: 'Money Math Games', type: 'Activity', level: 'L46-L48', language: 'English', status: 'Draft' },
];

export const PanelViews: React.FC<PanelViewsProps> = ({ activePanel, currentUser, token }) => {
  const {
    students, schools, usersList, reportsList, worksheetsList, teachersList,
    getDistrictStats, getBlockStats, updateStudentLocally,
  } = usePanelData(token, currentUser, activePanel);

  const panel = activePanel;

  const handleDownloadPDF = (student: Student, r: EvaluationReport) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print the PDF report card.');
      return;
    }

    const conceptBadges = Object.entries(r.conceptMastery)
      .map(([t, m]) => `<span class="badge ${m === 'Strong' ? 'badge-pass' : 'badge-fail'}">${t}: ${m}</span>`)
      .join(' ');

    const hasReasoning = !!r.reasoning;
    const reasoningHtml = hasReasoning
      ? `
        <div class="section-title">Educational Reasoning</div>
        <div class="reasoning-box">
          ${r.reasoning?.explanation?.headline ? `<div class="reasoning-headline">${r.reasoning.explanation.headline}</div>` : ''}
          ${r.reasoning?.explanation?.narrative ? `<div class="narrative-box-inner">${r.reasoning.explanation.narrative}</div>` : ''}
          ${r.reasoning?.prerequisiteLearningPath ? `
            <div class="reasoning-sub">Prerequisite Learning Path</div>
            ${r.reasoning.prerequisiteLearningPath.affectedCompetencies?.length ? `<div><strong>Affected Competencies:</strong> ${r.reasoning.prerequisiteLearningPath.affectedCompetencies.join(', ')}</div>` : ''}
            ${r.reasoning.prerequisiteLearningPath.supportingSkills?.length ? `<div><strong>Supporting Skills:</strong> ${r.reasoning.prerequisiteLearningPath.supportingSkills.join(', ')}</div>` : ''}
            ${r.reasoning.prerequisiteLearningPath.highPriorityFoundations?.length ? `<div><strong>High-Priority Foundations:</strong> ${r.reasoning.prerequisiteLearningPath.highPriorityFoundations.join(', ')}</div>` : ''}
          ` : ''}
        </div>
      `
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assessment Report - ${student.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: 700; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; font-weight: 500; }
          .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
          .info-item { font-size: 13px; }
          .info-item strong { color: #0f172a; }
          .section-title { font-size: 14px; font-weight: 700; border-left: 4px solid #4f46e5; padding-left: 10px; margin: 25px 0 15px 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
          .metric-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
          .metric-value { font-size: 22px; font-weight: 700; color: #4f46e5; }
          .metric-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 5px; letter-spacing: 0.5px; }
          .narrative-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; font-size: 13px; white-space: pre-line; margin-bottom: 25px; color: #334155; line-height: 1.6; }
          .reasoning-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
          .reasoning-headline { font-weight: 700; color: #1e3a8a; margin-bottom: 8px; }
          .narrative-box-inner { font-size: 12px; white-space: pre-line; color: #334155; line-height: 1.6; margin-bottom: 12px; }
          .reasoning-sub { font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin: 12px 0 6px; }
          .badge { display: inline-block; padding: 3px 8px; font-size: 9px; font-weight: 700; border-radius: 4px; text-transform: uppercase; font-family: monospace; margin: 2px; }
          .badge-pass { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
          .badge-fail { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
          .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">FLN Portal</div>
          <div class="subtitle">Foundation Level Diagnostic Evaluation Report</div>
        </div>

        <div class="student-info">
          <div class="info-item">Student Name: <strong>${student.name}</strong></div>
          <div class="info-item">Student ID: <strong>${student.id}</strong></div>
          <div class="info-item">Class / Section: <strong>${student.classGroup} - ${student.section}</strong></div>
          <div class="info-item">Report Date: <strong>${new Date(r.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
        </div>

        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${r.score} / ${r.totalQuestions}</div>
            <div class="metric-label">Diagnostic Score</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">L${r.recommendedLevel}.${r.recommendedSubLevel ?? 0}</div>
            <div class="metric-label">Placed Level</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0}%</div>
            <div class="metric-label">Accuracy Rate</div>
          </div>
        </div>

        <div class="section-title">Concept Mastery Breakdown</div>
        <div style="margin-bottom: 25px; display: flex; gap: 8px; flex-wrap: wrap;">
          ${conceptBadges}
        </div>

        <div class="section-title">AI Evaluation Summary</div>
        <div class="narrative-box">
          ${r.narrative}
        </div>

        ${reasoningHtml}

        <div class="footer">
          Generated automatically by the FLN Portal. Confidential Student Academic Record.
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

  // ===================== TEACHER PANELS =====================
  if (panel === 'student_list') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-4">
        <PageHeader title="Student Roster" desc="Complete list of registered students across your classes" icon={<Users className="h-5 w-5" />} />
        <EmptyStudents students={students} />
      </div>
    );
  }

  if (panel === 'student_profile') {
    const s = students.find(x => x.id === sel) || students[0];

    const filteredStudents = students.filter(x =>
      x.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      x.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const reports = reportsList.filter(r => r.studentId === s.id);
    const studentSchool = schools.find(sch => sch.id === s.schoolId);
    const att = ATTENDANCE_MOCK.find(a => a.student === s.name);
    const enrollmentDate = s.levelHistory[0]?.date;
    const daysSinceEnroll = enrollmentDate ? Math.floor((Date.now() - new Date(enrollmentDate).getTime()) / 86400000) : null;
    const canEditProfile = (() => {
      switch (currentUser.role) {
        case UserRole.SUPERADMIN:
        case UserRole.ADMIN:
        case UserRole.DISTRICT_ADMIN:
        case UserRole.BLOCK_ADMIN:
          return true;
        case UserRole.SCHOOL:
        case UserRole.TEACHER:
          return s.schoolId === currentUser.schoolId;
        case UserRole.VOLUNTEER:
          return currentUser.assignedSchools?.includes(s.schoolId) ?? false;
        default:
          return false;
      }
    })();
    // Mirrors the backend's redaction in GET /api/students — admins/volunteers
    // never receive guardianContact/address at all, so those fields are
    // indistinguishable from "not set" unless we check role here too.
    const canSeeGuardianPII = currentUser.role === UserRole.SUPERADMIN || currentUser.role === UserRole.SCHOOL || currentUser.role === UserRole.TEACHER;
    const startEditingProfile = () => {
      setProfileDraft({
        gender: s.gender, dob: s.dob, guardianName: s.guardianName, guardianRelation: s.guardianRelation,
        guardianContact: s.guardianContact, address: s.address, bloodGroup: s.bloodGroup,
        disabilityStatus: s.disabilityStatus, midDayMealBeneficiary: s.midDayMealBeneficiary,
        busRoute: s.busRoute, siblingsInSchool: s.siblingsInSchool, teacherNotes: s.teacherNotes,
      });
      setEditingProfile(true);
    };
    const saveProfile = async () => {
      setSavingProfile(true);
      try {
        const res = await apiFetch(`/api/students/${s.id}/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(profileDraft),
        });
        if (res.ok) {
          setApiStudents(prev => prev.map(st => st.id === s.id ? { ...st, ...profileDraft } : st));
          setEditingProfile(false);
        }
      } finally {
        setSavingProfile(false);
      }
    };
    const classStudents = students.filter(st => st.classGroup === s.classGroup);
    const classAvg = Math.round(classStudents.reduce((a, st) => a + st.currentLevel, 0) / Math.max(1, classStudents.length));
    const avgScore = reports.length > 0 ? Math.round(reports.reduce((a, r) => a + (r.score / r.totalQuestions) * 100, 0) / reports.length) : 0;
    const allSkills = new Map<string, { mastery: string; date: string }[]>();
    reports.forEach(r => Object.entries(r.conceptMastery).forEach(([topic, mastery]) => {
      if (!allSkills.has(topic)) allSkills.set(topic, []);
      allSkills.get(topic)!.push({ mastery, date: r.timestamp });
    }));
    const latestSkills = reports.length > 0 ? Object.entries(reports[0].conceptMastery) : [];
    const weakAreas = latestSkills.filter(([_, m]) => m !== 'Strong').map(([t]) => t);
    const recentActivity = [
      ...reports.map(r => ({ type: 'assessment' as const, label: `${r.score}/${r.totalQuestions} on ${r.worksheetId}`, date: r.timestamp, detail: `Score ${Math.round(r.score / r.totalQuestions * 100)}%` })),
      ...s.levelHistory.map(lh => ({ type: 'level_change' as const, label: `Level changed to L${lh.level}`, date: lh.date, detail: lh.reason })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const filteredActivity = activityFilter === 'all' ? recentActivity : recentActivity.filter(a => a.type === activityFilter);

    const tabs = [
      { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
      { key: 'academic' as const, label: 'Academic Record', icon: BookOpen },
      { key: 'personal' as const, label: 'Personal Details', icon: Users },
      { key: 'activity' as const, label: 'Activity Log', icon: Calendar },
    ];

    return (
      <div className="space-y-6">
        {/* Student selector header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">{s.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{s.name}</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">ID: {s.id}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${s.levelHistory.length > 0 ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'}`}>{s.levelHistory.length > 0 ? 'Active' : 'Pending Diagnostic'}</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate"><strong>{studentSchool?.name || 'N/A'}</strong> · {s.classGroup} - {s.section}{daysSinceEnroll !== null && ` · Enrolled ${daysSinceEnroll} days ago`}</p>
            </div>
            {/* Searchable student selector */}
            <div className="relative shrink-0">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 min-w-[180px] text-left">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="flex-1 truncate">{s.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search students..." className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredStudents.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No students found</p>
                      ) : filteredStudents.map(x => {
                        const isSelected = x.id === sel;
                        const xAtt = ATTENDANCE_MOCK.find(a => a.student === x.name);
                        return (
                          <button key={x.id} onClick={() => { setSel(x.id); setProfileTab('overview'); setShowDropdown(false); setSearchQuery(''); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{x.name.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{x.name}</div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                                <span>{x.classGroup}-{x.section}</span>
                                <span className="font-mono font-bold">L{x.currentLevel}</span>
                                {xAtt && <span className={xAtt.percentage >= 85 ? 'text-emerald-500' : 'text-amber-500'}>{xAtt.percentage}%</span>}
                              </div>
                            </div>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center"><div className="text-lg font-bold text-slate-900 dark:text-white">{reports.length}</div><div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">Assessments</div></div>
            <div className="text-center"><div className={`text-lg font-bold ${avgScore >= 70 ? 'text-emerald-600' : avgScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{avgScore > 0 ? `${avgScore}%` : '—'}</div><div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">Avg Score</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">L{s.currentLevel}</div><div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">Current Level</div></div>
            <div className="text-center"><div className="text-lg font-bold text-slate-900 dark:text-white">{s.streak}</div><div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">Day Streak</div></div>
            <div className="text-center hidden sm:block"><div className={`text-lg font-bold ${att ? (att.percentage >= 85 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400'}`}>{att ? `${att.percentage}%` : '—'}</div><div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">Attendance</div></div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setProfileTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${profileTab === t.key ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {profileTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Status Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 shadow-lg text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">{s.name.charAt(0)}</div>
                  <div><div className="font-bold text-lg">{s.name}</div><div className="text-xs text-slate-400">{s.classGroup} - {s.section}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div className="text-center"><div className="text-2xl font-bold text-emerald-400">L{s.currentLevel}</div><div className="text-[9px] text-slate-400 uppercase font-mono">Current Level</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-amber-400">{s.streak}</div><div className="text-[9px] text-slate-400 uppercase font-mono">Day Streak</div></div>
                </div>
                <div className="pt-1"><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progress to L{s.targetLevel}</span><span>{Math.round((s.currentLevel / s.targetLevel) * 100)}%</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (s.currentLevel / s.targetLevel) * 100)}%` }} /></div></div>
              </div>

              {/* Class Comparison */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Class Comparison</h3>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-500 dark:text-slate-400">This Student</span><span className="font-bold text-indigo-600">L{s.currentLevel}</span></div><div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(s.currentLevel / 93) * 100}%` }} /></div></div>
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-500 dark:text-slate-400">Class Average ({classStudents.length} students)</span><span className="font-bold text-slate-700 dark:text-slate-200">L{classAvg}</span></div><div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-slate-500 rounded-full transition-all" style={{ width: `${(classAvg / 93) * 100}%` }} /></div></div>
                  <div className={`p-2 rounded-lg text-xs font-medium text-center ${s.currentLevel > classAvg ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : s.currentLevel === classAvg ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>
                    {s.currentLevel > classAvg ? `↑ ${s.currentLevel - classAvg} levels above class average` : s.currentLevel === classAvg ? 'At class average' : `↓ ${classAvg - s.currentLevel} levels below class average`}
                  </div>
                </div>
                {/* Class rank */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400">Class Rank</span><span className="font-bold font-mono text-slate-800 dark:text-slate-100">#{classStudents.sort((a, b) => b.currentLevel - a.currentLevel).findIndex(x => x.id === s.id) + 1} / {classStudents.length}</span></div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-2.5 text-sm">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Quick Info</h3>
                {[['Age', `${s.age} yrs`], ['Class & Section', `${s.classGroup} - ${s.section}`], ['Current Level', `L${s.currentLevel}`], ['Attendance', att ? `${att.present}/${att.total} (${att.percentage}%)` : 'N/A']].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-1.5"><span className="text-slate-500 dark:text-slate-400">{l}</span><span className="font-medium text-slate-800 dark:text-slate-100">{v || 'N/A'}</span></div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Score Trend Chart */}
              {reports.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Score Trend</h3>
                  <div className="relative">
                    <div className="flex items-end gap-3 h-40 border-b border-l border-slate-200 dark:border-slate-700 ml-8 pb-2 pl-2">
                      {reports.map((r, i) => {
                        const pct = Math.round((r.score / r.totalQuestions) * 100);
                        const barH = Math.max(pct * 0.8, 10);
                        const isUp = i === 0 || pct >= Math.round((reports[i - 1].score / reports[i - 1].totalQuestions) * 100);
                        return (
                          <div key={r.id} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                            <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8">
                              <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded whitespace-nowrap">{pct}%</span>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">{pct}%</span>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative overflow-hidden flex-1 self-stretch" style={{ height: `${barH}px` }}>
                              <div className={`absolute bottom-0 inset-x-0 rounded-t-lg transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ height: `${pct}%` }} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500">{new Date(r.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              <span className={`text-[8px] ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>{isUp ? '↑' : '↓'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {reports.length >= 2 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Trend: <strong className={avgScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}>{avgScore}% avg</strong></span>
                        <span>Best: <strong className="text-emerald-600">{Math.max(...reports.map(r => Math.round((r.score / r.totalQuestions) * 100)))}%</strong></span>
                        <span>Last: <strong>{Math.round((reports[reports.length - 1].score / reports[reports.length - 1].totalQuestions) * 100)}%</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Level Journey */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Level Journey</h3>
                {s.levelHistory.length > 0 ? (
                  <div className="space-y-0 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    {[...s.levelHistory].reverse().map((lh, i) => (
                      <div key={i} className="flex gap-4 pb-4 relative pl-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow mt-1 shrink-0 z-10" />
                        <div className="flex-1"><div className="flex justify-between"><div><span className="font-bold text-sm text-slate-900 dark:text-white">Level {lh.level}{lh.subLevel !== undefined ? `.${lh.subLevel}` : ''}</span><p className="text-xs text-slate-500 dark:text-slate-400">{lh.reason}</p></div><span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">{lh.date}</span></div></div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-6"><p className="text-xs text-slate-400 dark:text-slate-500">No level history yet.</p></div>}
                {s.levelHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Next Targets</h4>
                    <div className="flex items-center gap-1 text-[10px] font-mono flex-wrap">
                      {Array.from({ length: Math.min(5, s.targetLevel - s.currentLevel + 1) }, (_, i) => s.currentLevel + i).map((lvl, i) => (
                        <React.Fragment key={lvl}>{i > 0 && <span className="text-slate-300 dark:text-slate-600">→</span>}<span className={`px-2 py-0.5 rounded border ${lvl <= s.currentLevel ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}>L{lvl}</span></React.Fragment>
                      ))}
                      {s.targetLevel > s.currentLevel + 5 && <span className="text-slate-300 dark:text-slate-600">… → L{s.targetLevel}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Skill Proficiency</h3>
                {latestSkills.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {latestSkills.map(([topic, mastery]) => {
                      const pct = mastery === 'Strong' ? 90 : mastery === 'Satisfactory' ? 60 : 30;
                      const history = allSkills.get(topic) || [];
                      const improving = history.length >= 2 && history[0].mastery !== history[history.length - 1].mastery;
                      return (
                        <div key={topic} className="border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{topic}</span>
                            <span className={`flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${mastery === 'Strong' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : mastery === 'Satisfactory' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>
                              {mastery}
                              {improving && <span className="text-emerald-500">↑</span>}
                            </span>
                          </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${mastery === 'Strong' ? 'bg-emerald-500' : mastery === 'Satisfactory' ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                          {history.length >= 2 && (
                            <div className="flex gap-1 mt-1.5">
                              {history.map((h, hi) => (
                                <span key={hi} className={`text-[7px] font-mono px-1 py-0.5 rounded ${h.mastery === 'Strong' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : h.mastery === 'Satisfactory' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'}`}>
                                  {h.mastery === 'Strong' ? 'S' : h.mastery === 'Satisfactory' ? 'Sat' : 'NP'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="text-center py-6"><p className="text-xs text-slate-400 dark:text-slate-500">No skill data yet.</p></div>}
              </div>

              {/* Recommended Focus */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Recommended Focus Areas</h3>
                <div className="space-y-2">
                  {weakAreas.length > 0 ? weakAreas.map(topic => (
                    <div key={topic} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-800"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />Additional practice recommended for <strong>{topic}</strong></div>
                  )) : reports.length > 0 ? <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-800"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />All skills at expected level — no focus areas needed</div> : <div className="text-sm text-slate-500 dark:text-slate-400">Complete a diagnostic assessment to generate recommendations.</div>}
                  {s.currentLevel < 93 && <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-800"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />Next milestone: <strong>Level {Math.min(93, s.currentLevel + 1)}</strong></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ACADEMIC TAB ===== */}
        {profileTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Academic Summary</h3>
                <div className="space-y-2.5 text-sm">
                  {[['Total Assessments', String(reports.length)], ['Avg Score', reports.length > 0 ? `${avgScore}%` : 'N/A'], ['Current Level', `L${s.currentLevel}.${s.currentSubLevel ?? 0}`], ['Target Level', `L${s.targetLevel}`], ['Sub-Level Status', s.currentSubLevel === 0 ? 'Mastery' : s.currentSubLevel === 1 ? 'Easier' : 'Remedial'], ['Day Streak', `${s.streak}`], ['Attendance', att ? `${att.percentage}% (${att.present}/${att.total} days)` : 'N/A']].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-1.5"><span className="text-slate-500 dark:text-slate-400">{l}</span><span className="font-medium text-slate-800 dark:text-slate-100">{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Curriculum Coverage</h3>
                <div className="space-y-2">
                  {['Number Sense', 'Number Operations', 'Shapes & Geometry', 'Measurement', 'Patterns & Algebra', 'Data Handling'].map(strand => {
                    const lvlForStrand = ['Number Sense', 'Number Operations'].includes(strand) ? s.currentLevel : Math.max(0, s.currentLevel - 5);
                    const covered = lvlForStrand > 15;
                    const partial = lvlForStrand > 8;
                    return <div key={strand} className="flex items-center justify-between gap-2 text-sm py-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`${covered ? 'text-emerald-600' : partial ? 'text-amber-500' : 'text-slate-300'}`}>{covered ? '✓' : partial ? '◐' : '○'}</span>
                        <span className={covered ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'}>{strand}</span>
                      </div>
                      <span className={`text-[9px] font-mono ${covered ? 'text-emerald-600' : partial ? 'text-amber-500' : 'text-slate-300'}`}>{covered ? 'Covered' : partial ? 'Partial' : 'Not Started'}</span>
                    </div>;
                  })}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Progress Highlights</h3>
                <div className="space-y-2 text-sm">
                  {reports.length > 0 && <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Best Score</span><span className="font-bold text-emerald-600">{Math.max(...reports.map(r => Math.round((r.score / r.totalQuestions) * 100)))}%</span></div>}
                  {reports.length > 0 && <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Recent Score</span><span className="font-bold text-slate-800 dark:text-slate-100">{Math.round((reports[reports.length - 1].score / reports[reports.length - 1].totalQuestions) * 100)}%</span></div>}
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Levels Gained</span><span className="font-bold text-slate-800 dark:text-slate-100">{s.levelHistory.length > 0 ? s.currentLevel - s.levelHistory[0].level : 0}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Strong Skills</span><span className="font-bold text-slate-800 dark:text-slate-100">{latestSkills.filter(([_, m]) => m === 'Strong').length}/{latestSkills.length}</span></div>
                  {s.levelHistory.length > 0 && <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Since</span><span className="font-mono text-xs text-slate-600 dark:text-slate-300">{s.levelHistory[0].date}</span></div>}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">All Assessment Reports</h3>
                {reports.length > 0 ? <div className="space-y-4">{reports.map(r => {
                  const scorePct = Math.round((r.score / r.totalQuestions) * 100);
                  return (
                    <div key={r.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${scorePct >= 80 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : scorePct >= 60 ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>{scorePct}%</div>
                          <div><span className="text-sm font-semibold text-slate-900 dark:text-white">{r.worksheetId}</span><div className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(r.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${scorePct >= 80 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : scorePct >= 60 ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>{r.score}/{r.totalQuestions}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{r.narrative}</p>
                      <div className="flex flex-wrap gap-1.5">{Object.entries(r.conceptMastery).map(([t, m]) => (
                        <span key={t} className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${m === 'Strong' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : m === 'Satisfactory' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>{t}: {m}</span>
                      ))}</div>
                      
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <button onClick={() => setExpandedReportId(expandedReportId === r.id ? null : r.id)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                          {expandedReportId === r.id ? 'Hide Details' : '📋 View Persisted Report Details'}
                    
                        
                        </button>
                        <button onClick={() => handleDownloadPDF(s, r)} className="text-xs font-semibold text-emerald-650 hover:text-emerald-800 flex items-center gap-1">
                          📥 Download PDF Report
                        </button>
                      </div>

                      {expandedReportId === r.id && (
                        <div className="mt-3 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 text-xs">
                          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">Persisted Report Details (from backend EvaluationReport)</div>
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Score</span>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.score} / {r.totalQuestions}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Placed Level</span>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">L{r.recommendedLevel}.{r.recommendedSubLevel ?? 0}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Accuracy</span>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0}%</span>
                              </div>
                            </div>
                            {r.totalQuestions === 0 && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                Per-question responses are not persisted by the backend — only aggregate score, placement, and concept mastery are stored on this EvaluationReport.
                              </div>
                            )}
                            <ReasoningSection report={r} title="Educational Reasoning" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}</div> : <div className="text-center py-8"><p className="text-xs text-slate-400 dark:text-slate-500">No assessment reports yet.</p></div>}
              </div>
            </div>
          </div>
        )}

  if (panel === 'student_profile') return <StudentProfilePanel students={students} schools={schools} reportsList={reportsList} currentUser={currentUser} token={token} updateStudentLocally={updateStudentLocally} />;

  if (panel === 'diagnostic_test') return <DiagnosticTestPanel students={students} />;

  if (panel === 'adaptive_test') return <AdaptiveTestPanel />;

  if (panel === 'test_history') return <TestHistoryPanel />;

  if (panel === 'worksheets') return <WorksheetsPanel reportsList={reportsList} worksheetsList={worksheetsList} />;

  if (panel === 'performance') return <PerformancePanel students={students} currentUser={currentUser} />;

  if (panel === 'performance') {
    const isTeacher = currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.VOLUNTEER;
    const topStudents = [...students].sort((a, b) => b.currentLevel - a.currentLevel).slice(0, 5);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard title="Total Students" value={students.length} subtext="Active roster" icon={Users} />
          <MetricCard title="Avg Level" value={`L${Math.round(students.reduce((a, s) => a + s.currentLevel, 0) / students.length)}`} subtext="Class average" icon={BarChart3} />
          <MetricCard title="Certified" value={`${students.filter(s => s.currentLevel >= 5).length}`} subtext="Level 5+ achieved" icon={Award} />
          <MetricCard title="Pending Diagnostic" value={students.filter(s => s.levelHistory.length === 0).length} subtext="Need placement" icon={ShieldAlert} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <PageHeader title={isTeacher ? "Class Performance" : "School Performance"} desc="FLN level distribution and trends" />
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Top Performing Students</h4>
            <div className="space-y-2">{topStudents.map(s => (
              <div key={s.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3"><span className="text-sm font-semibold">{s.name}</span><span className="text-xs text-slate-400 dark:text-slate-500">{s.classGroup}</span></div>
                <div className="flex items-center gap-4"><div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(s.currentLevel / 93) * 100}%` }} /></div><span className="font-mono font-bold text-sm">L{s.currentLevel}</span></div>
              </div>
            ))}</div>
          </div>
        </div>
      </div>
    );
  }

  if (panel === 'reports') {
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
            const isExpanded = expandedReportId === r.id;

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

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex gap-3">
                    <button onClick={() => setExpandedReportId(isExpanded ? null : r.id)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      {isExpanded ? 'Hide Details' : '📋 View Persisted Report Details'}
                    </button>
                    {student && (
                      <button onClick={() => handleDownloadPDF(student, r)} className="text-xs font-semibold text-emerald-650 hover:text-emerald-800 flex items-center gap-1">
                        📥 Download PDF Report
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Assigned from Diagnostic Pipeline</span>
                </div>

                {isExpanded && (
                  <div className="mt-3 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 text-xs">
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">Persisted Report Details (from backend EvaluationReport)</div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Score</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.score} / {r.totalQuestions}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Placed Level</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">L{r.recommendedLevel}.{r.recommendedSubLevel ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Accuracy</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0}%</span>
                        </div>
                      </div>
                      {r.totalQuestions === 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          Per-question responses are not persisted by the backend — only aggregate score, placement, and concept mastery are stored on this EvaluationReport.
                        </div>
                      )}
                      <ReasoningSection report={r} title="Educational Reasoning" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===================== VOLUNTEER PANELS =====================
  if (panel === 'assigned_schools') return <AssignedSchoolsPanel schools={schools} students={students} />;

  if (panel === 'student_progress') return <StudentProgressPanel students={students} />;

  if (panel === 'attendance') return <AttendancePanel students={students} reportsList={reportsList} />;

  // ===================== PRINCIPAL / SCHOOL ADMIN PANELS =====================
  if (panel === 'teachers' && (currentUser.role === UserRole.SCHOOL || currentUser.role === UserRole.BLOCK_ADMIN)) return <TeachersPanel schools={schools} teachersList={teachersList} currentUser={currentUser} />;

  // ===================== BLOCK/DISTRICT/STATE ADMIN + SUPERADMIN SHARED PANELS =====================
  if (panel === 'schools') return <SchoolsPanel schools={schools} />;

  if (panel === 'districts') return <DistrictsPanel currentUser={currentUser} schools={schools} students={students} getDistrictStats={getDistrictStats} />;

  if (panel === 'blocks') return <BlocksPanel currentUser={currentUser} getBlockStats={getBlockStats} />;

  // ===================== SUPERADMIN PANELS =====================
  if (panel === 'users') return <UsersPanel usersList={usersList} />;


  if (panel === 'worksheet_templates') return <WorksheetTemplatesPanel />;

  if (panel === 'content') return <ContentPanel />;

  if (panel === 'analytics') return <AnalyticsPanel currentUser={currentUser} schools={schools} students={students} getDistrictStats={getDistrictStats} getBlockStats={getBlockStats} />;

  if (panel === 'system_settings') return <SystemSettingsPanel />;

  // Fallback for any unmatched panel — renders the roles workspace (dashboard) as the content
  return null;
};

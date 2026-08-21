import { apiFetch, withBase } from '../services/apiClient';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole, Student, ClassGroup, School, LogEntry, Ticket, DashboardProps } from '../types';

import { DiagnosticWorkflow } from './DiagnosticWorkflow';
import { BulkDiagnosticWorkflow } from './BulkDiagnosticWorkflow';
import { WorksheetWorkflow } from './WorksheetWorkflow';
import { LogbookView } from './LogbookView';
import { TicketSubmission } from './TicketSubmission';
import { IcrScanner } from './IcrScanner';
import { BaselineUpload } from './BaselineUpload';
import { SkillGraphPanel } from './SkillGraphPanel';
import { Users, ShieldAlert, BookOpen, UserCheck, Calendar, ArrowRight, CheckCircle2, XCircle, SlidersHorizontal, Layers, Award, MapPin, School as SchoolIcon, BarChart3, FileText, ClipboardList, Layers as BulkIcon } from 'lucide-react';
import { Table, Column } from './Table';
import { MetricCard } from './Card';
import { Input, Select, Textarea } from './Form';
import { SuperAdminExecutiveDashboard } from './SuperAdminExecutiveDashboard';



export const FLN_LEVELS_LIST = [
  // Stage 1: Preschool 1 (Age 3-4)
  { id: 1, class: "Preschool 1", name: "One-to-One Correspondence", strand: "Pre-Number Foundations" },
  { id: 2, class: "Preschool 1", name: "Classification (Single Property)", strand: "Pre-Number Foundations" },
  { id: 3, class: "Preschool 1", name: "Perceptual Same/Different", strand: "Pre-Number Foundations" },
  { id: 4, class: "Preschool 1", name: "Rote Verbal Counting to 10", strand: "Number Sense" },
  { id: 5, class: "Preschool 1", name: "Counting Small Sets (1-3)", strand: "Number Sense" },
  { id: 6, class: "Preschool 1", name: "Shape Matching (Perceptual)", strand: "Shapes & Spatial" },
  { id: 7, class: "Preschool 1", name: "Perceptual Subitizing", strand: "Number Sense" },

  // Stage 2: Preschool 2 (Age 4-5)
  { id: 8, class: "Preschool 2", name: "Quantity Comparison", strand: "Pre-Number Foundations" },
  { id: 9, class: "Preschool 2", name: "Seriation (3 Objects)", strand: "Pre-Number Foundations" },
  { id: 10, class: "Preschool 2", name: "Classification (Increasing Complexity)", strand: "Pre-Number Foundations" },
  { id: 11, class: "Preschool 2", name: "Counting to 5 (Cardinality)", strand: "Number Sense" },
  { id: 12, class: "Preschool 2", name: "Counting 6-10", strand: "Number Sense" },
  { id: 13, class: "Preschool 2", name: "Shape Identification", strand: "Shapes & Spatial" },
  { id: 14, class: "Preschool 2", name: "2-Item Patterns", strand: "Patterns" },
  { id: 15, class: "Preschool 2", name: "Comparative Vocabulary", strand: "Measurement" },
  { id: 16, class: "Preschool 2", name: "Conceptual Subitizing", strand: "Number Sense" },
  { id: 17, class: "Preschool 2", name: "Basic Shape Composition", strand: "Shapes & Spatial" },

  // Stage 3: Preschool 3 / Balvatika (Age 5-6)
  { id: 18, class: "Preschool 3", name: "Numeral Recognition (1-10)", strand: "Number Sense" },
  { id: 19, class: "Preschool 3", name: "Numeral-Quantity Correspondence", strand: "Number Sense" },
  { id: 20, class: "Preschool 3", name: "Numeral Comparison (Object-Mediated)", strand: "Pre-Number Foundations" },
  { id: 21, class: "Preschool 3", name: "Seriation with Transitivity", strand: "Pre-Number Foundations" },
  { id: 22, class: "Preschool 3", name: "Flexible Classification", strand: "Pre-Number Foundations" },
  { id: 23, class: "Preschool 3", name: "Numeral Sequencing", strand: "Number Sense" },
  { id: 24, class: "Preschool 3", name: "Comparative Vocabulary (Formalizing)", strand: "Measurement" },
  { id: 25, class: "Preschool 3", name: "Patterns (2-Item Indep & 3-Item Intro)", strand: "Patterns" },
  { id: 26, class: "Preschool 3", name: "Basic Shape Properties", strand: "Shapes & Spatial" },
  { id: 27, class: "Preschool 3", name: "Shape Composition & Decomposition", strand: "Shapes & Spatial" },

  // Stage 4: Class 1 (Age 6-7)
  { id: 28, class: "Class 1", name: "Abstract Numeral Comparison", strand: "Number Sense" },
  { id: 29, class: "Class 1", name: "Close Numeral Comparison", strand: "Number Sense" },
  { id: 30, class: "Class 1", name: "Counting Objects to 20", strand: "Number Sense" },
  { id: 31, class: "Class 1", name: "Reading & Writing Numerals to 99", strand: "Number Sense" },
  { id: 32, class: "Class 1", name: "Tens and Ones", strand: "Number Sense" },
  { id: 33, class: "Class 1", name: "Single-Digit Addition", strand: "Number Operations" },
  { id: 34, class: "Class 1", name: "Single-Digit Subtraction", strand: "Number Operations" },
  { id: 35, class: "Class 1", name: "3D Shape Properties", strand: "Shapes & Spatial" },
  { id: 36, class: "Class 1", name: "Non-Standard Length Estimation", strand: "Measurement" },
  { id: 37, class: "Class 1", name: "Non-Standard Capacity Estimation", strand: "Measurement" },
  { id: 38, class: "Class 1", name: "3-Item Pattern Completion", strand: "Patterns" },
  { id: 39, class: "Class 1", name: "Concept of Zero", strand: "Number Sense" },
  { id: 40, class: "Class 1", name: "Ordinal Positions (1st-10th)", strand: "Number Sense" },
  { id: 41, class: "Class 1", name: "Informal Number Line (0-20)", strand: "Number Sense" },
  { id: 42, class: "Class 1", name: "Advanced Shape Composition", strand: "Shapes & Spatial" },

  // Stage 5: Class 2 (Age 7-8)
  { id: 43, class: "Class 2", name: "Reading & Writing 3-Digit Numbers", strand: "Number Sense" },
  { id: 44, class: "Class 2", name: "Tens as Bundles/Groups", strand: "Number Sense" },
  { id: 45, class: "Class 2", name: "Flexible 2-Digit Decomposition", strand: "Number Sense" },
  { id: 46, class: "Class 2", name: "2-Digit Addition with Regrouping", strand: "Number Operations" },
  { id: 47, class: "Class 2", name: "2-Digit Subtraction with Regrouping", strand: "Number Operations" },
  { id: 48, class: "Class 2", name: "Multiplication as Repeated Addition", strand: "Number Operations" },
  { id: 49, class: "Class 2", name: "Division as Equal Sharing", strand: "Number Operations" },
  { id: 50, class: "Class 2", name: "Multiplication Tables (2,3,4,5,10)", strand: "Number Operations" },
  { id: 51, class: "Class 2", name: "Currency Recognition", strand: "Money" },
  { id: 52, class: "Class 2", name: "Informal Fractions (Folding)", strand: "Fractions" },
  { id: 53, class: "Class 2", name: "Uniform Non-Standard Measurement", strand: "Measurement" },
  { id: 54, class: "Class 2", name: "2D Shape Set Identification", strand: "Shapes & Spatial" },
  { id: 55, class: "Class 2", name: "Spatial Vocabulary", strand: "Shapes & Spatial" },
  { id: 56, class: "Class 2", name: "Calendar Reading", strand: "Calendar & Time" },
  { id: 57, class: "Class 2", name: "Data Handling (Sorting & Tallies)", strand: "Data Handling" },
  { id: 58, class: "Class 2", name: "Number Patterns & Sequences", strand: "Patterns" },
  { id: 59, class: "Class 2", name: "Zero as a Placeholder", strand: "Number Sense" },
  { id: 60, class: "Class 2", name: "Extended Number Line (0-100)", strand: "Number Sense" },
  { id: 61, class: "Class 2", name: "Skip Counting (2s, 5s, 10s)", strand: "Patterns" },

  // Stage 6: Class 3 (Age 8-9)
  { id: 62, class: "Class 3", name: "3-Digit Place Value & Expanded Form", strand: "Number Sense" },
  { id: 63, class: "Class 3", name: "Flexible 3-Digit Decomposition", strand: "Number Sense" },
  { id: 64, class: "Class 3", name: "3-Digit Comparison & Ordering", strand: "Number Sense" },
  { id: 65, class: "Class 3", name: "Reading & Writing 4-Digit Numbers", strand: "Number Sense" },
  { id: 66, class: "Class 3", name: "3-Digit Addition & Subtraction Problems", strand: "Number Operations" },
  { id: 67, class: "Class 3", name: "Full Multiplication Tables (2-10)", strand: "Number Operations" },
  { id: 68, class: "Class 3", name: "Division Facts & Inverse Relation", strand: "Number Operations" },
  { id: 69, class: "Class 3", name: "Standard Measurement Units", strand: "Measurement" },
  { id: 70, class: "Class 3", name: "Relating 2D Faces to 3D Solids", strand: "Shapes & Spatial" },
  { id: 71, class: "Class 3", name: "Telling Time (Hours & Half-Hours)", strand: "Calendar & Time" },
  { id: 72, class: "Class 3", name: "Money Arithmetic", strand: "Money" },
  { id: 73, class: "Class 3", name: "Formal Fractions (Half/Quarter)", strand: "Fractions" },
  { id: 74, class: "Class 3", name: "Pattern Rules & Generalization", strand: "Patterns" },
  { id: 75, class: "Class 3", name: "Data Handling (Pictographs & Bar Graphs)", strand: "Data Handling" },

  // Stage 7: Class 4 (Age 9-10)
  { id: 76, class: "Class 4", name: "4-Digit & 5-Digit Place Value", strand: "Number Sense" },
  { id: 77, class: "Class 4", name: "Large Number Operations & Regrouping", strand: "Number Sense" },
  { id: 78, class: "Class 4", name: "Complex Multi-Digit Word Problems", strand: "Number Operations" },
  { id: 79, class: "Class 4", name: "Extended Multiplication", strand: "Number Operations" },
  { id: 80, class: "Class 4", name: "Formal Long Division", strand: "Number Operations" },
  { id: 81, class: "Class 4", name: "Fractional Notation & Equivalence", strand: "Fractions" },
  { id: 82, class: "Class 4", name: "Standard Unit Conversion", strand: "Measurement" },
  { id: 83, class: "Class 4", name: "Applied Measurement Word Problems", strand: "Measurement" },
  { id: 84, class: "Class 4", name: "3D Nets & Spatial Perspective", strand: "Shapes & Spatial" },
  { id: 85, class: "Class 4", name: "Advanced Time Calculation", strand: "Calendar & Time" },
  { id: 86, class: "Class 4", name: "Complex Money Problems", strand: "Money" },
  { id: 87, class: "Class 4", name: "Advanced Number Patterns", strand: "Patterns" },
  { id: 88, class: "Class 4", name: "Bar Graphs & Data Interpretation", strand: "Data Handling" },
  { id: 89, class: "Class 4", name: "Factors & Multiples", strand: "Number Operations" },
  { id: 90, class: "Class 4", name: "Decimals (Tenths & Hundredths)", strand: "Number Sense" },
  { id: 91, class: "Class 4", name: "Angles & Turn", strand: "Shapes & Spatial" },
  { id: 92, class: "Class 4", name: "Symmetry & Reflection", strand: "Shapes & Spatial" },
  { id: 93, class: "Class 4", name: "Perimeter & Area", strand: "Measurement" }
];

export const FLNLevelReferenceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  if (!isOpen) return null;

  const classesList = ['All', 'Preschool 1', 'Preschool 2', 'Preschool 3', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Review'];

  const filtered = FLN_LEVELS_LIST.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.strand.toLowerCase().includes(search.toLowerCase());
    const matchClass = selectedClass === 'All' || l.class === selectedClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-700">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">📖 FLN Levels Framework Reference</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Explore details of the 93 curriculum levels spanning Preschool 1 to Class 4</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-650 text-sm font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 p-2 rounded-lg">Close</button>
        </div>

        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Search Level/Strand</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Addition, shapes, numbers..."
              className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 outline-none focus:border-zinc-500 bg-white dark:bg-slate-900 text-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Filter by Class</label>
            <div className="flex flex-wrap gap-1">
              {classesList.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`text-[10px] font-mono font-semibold px-2 py-1.5 rounded border transition-colors ${
                    selectedClass === c ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white dark:bg-slate-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((l) => (
              <div key={l.id} className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm hover:border-zinc-350 dark:hover:border-zinc-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      Level {l.id}
                    </span>
                    <span className="text-[9px] font-mono font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                      {l.class}
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-zinc-900 dark:text-white text-sm mt-2">{l.name}</h4>
                </div>
                <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 dark:border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  <span>Strand: <strong className="text-zinc-700 dark:text-zinc-200">{l.strand}</strong></span>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const STATE_NAMES: Record<string, string> = {
  'PB': 'Punjab',
  'HR': 'Haryana',
  'RJ': 'Rajasthan',
  'UP': 'Uttar Pradesh'
};

const DISTRICT_NAMES: Record<string, string> = {
  'LDH': 'Ludhiana',
  'MOG': 'Moga',
  'AMB': 'Ambala',
  'JAI': 'Jaipur',
  'LKO': 'Lucknow'
};

// export type { DashboardProps };


// ==========================================
// GEOGRAPHICAL COMPARATIVE ANALYTICS (SHARED VIEW)
// ==========================================
import { RegionalAnalyticsView } from './dashboards/RegionalAnalyticsView';
export { RegionalAnalyticsView } from './dashboards/RegionalAnalyticsView';

// ==========================================
// 1. SUPERADMIN (NATIONAL) DASHBOARD
// ==========================================
import { SuperadminDashboard } from './dashboards/SuperadminDashboard';
export { SuperadminDashboard } from './dashboards/SuperadminDashboard';



// ==========================================
// 2. STATE ADMIN / DISTRICT ADMIN / BLOCK ADMIN DASHBOARDS
// ==========================================
export const AdminDashboard: React.FC<DashboardProps> = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'access'>('overview');
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schRes = await apiFetch('/api/schools', { headers: { 'Authorization': `Bearer ${token}` } });
        const schData = await schRes.json();
        if (Array.isArray(schData)) setSchools(schData);

        const stdRes = await apiFetch('/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
        const stdData = await stdRes.json();
        if (Array.isArray(stdData)) setStudents(stdData);

        const uRes = await apiFetch('/api/admin/coordinators', { headers: { 'Authorization': `Bearer ${token}` } });
        const uData = await uRes.json();
        if (Array.isArray(uData)) setAllUsers(uData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  // Determine appropriate dashboard header details
  const stateCode = user.stateCode || 'PB';
  const stateName = STATE_NAMES[stateCode] || stateCode;
  const districtCode = user.districtCode || 'LDH';
  const districtName = DISTRICT_NAMES[districtCode] || districtCode;
  const blockCode = user.blockCode || 'LDH-01';

  let panelTitle = 'Regional Oversight Center';
  let panelSub = 'State administration and reporting node.';
  if (user.role === UserRole.ADMIN) {
    panelTitle = `State Oversight Center: ${stateName}`;
    panelSub = `State Coordinator ${stateCode} · Performance Oversight Console`;
  } else if (user.role === UserRole.DISTRICT_ADMIN) {
    panelTitle = `District Oversight Center: ${districtName}`;
    panelSub = `District Officer ${stateCode}-${districtCode} · Scoped Administrative Node`;
  } else if (user.role === UserRole.BLOCK_ADMIN) {
    panelTitle = `Block Administrative Console: ${blockCode}`;
    panelSub = `Block Supervisor ${stateCode}-${districtCode}-${blockCode} · Localized Facility Audit Roster`;
  }

  // Filter schools based on user's regional scope
  const scopedSchools = schools.filter(s => {
    if (user.role === UserRole.ADMIN) {
      return s.stateCode === stateCode;
    }
    if (user.role === UserRole.DISTRICT_ADMIN) {
      return s.stateCode === stateCode && s.districtCode === districtCode;
    }
    if (user.role === UserRole.BLOCK_ADMIN) {
      return s.stateCode === stateCode && s.districtCode === districtCode && s.blockCode === blockCode;
    }
    return true;
  });

  const scopedSchoolIds = scopedSchools.map(s => s.id);
  const scopedStudents = students.filter(s => scopedSchoolIds.includes(s.schoolId));

  // Calculate dynamic pipeline metrics
  const studentsCount = scopedStudents.length;
  const certifiedCount = scopedStudents.filter(s => s.currentLevel >= 5).length;
  const conductedExams = scopedSchools.length * 3 || 0;
  const ingestedSheets = studentsCount * 2 || 0;

  // Compile performance & lagging metrics per school
  const schoolPerformance = scopedSchools.map(sch => {
    const schStudents = students.filter(s => s.schoolId === sch.id);
    const total = schStudents.length;
    const certified = schStudents.filter(s => s.currentLevel >= 5).length;
    const rate = total > 0 ? Math.round((certified / total) * 100) : 0;
    
    let statusText = '';
    let isLagging = false;
    if (total === 0) {
      statusText = 'No active students preseeded';
    } else if (rate < 50) {
      statusText = `Lagging <50% (${rate}% Certified)`;
      isLagging = true;
    } else {
      statusText = `${rate}% Certified`;
    }

    const deploymentMode = `${sch.teachersCount || 0} teachers assigned`;

    return {
      schoolId: sch.id,
      name: sch.name,
      district: DISTRICT_NAMES[sch.districtCode] || sch.districtCode,
      deploymentMode,
      statusText,
      isLagging,
      certifiedRate: rate
    };
  });

  // Dynamic volunteer roster assignments
  const preseededVolunteers = [
    { name: 'Rahul Kumar', email: 'vol.rahul@fln.org', assignedSchools: ['gps-vl-002'], status: 'On-Site Active' },
    { name: 'Amit Saini', email: 'vol.amit@fln.org', assignedSchools: ['gps-vl-002', 'gps-jai-004'], status: 'On-Site Active' },
    { name: 'Sneha Verma', email: 'vol.up_sneha@fln.org', assignedSchools: ['gps-lko-005'], status: 'Field Onboarding' },
    { name: 'Vipin Yadav', email: 'vol.hr_vipin@fln.org', assignedSchools: ['gps-amb-003'], status: 'On-Site Active' }
  ];

  const scopedVolunteers = preseededVolunteers.filter(v => 
    v.assignedSchools.some(schId => scopedSchoolIds.includes(schId))
  );

  return (
    <div className="space-y-6" id="admin-dashboard">
      <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white tracking-tight">{panelTitle}</h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-0.5">{panelSub}</p>
        </div>

        {/* Local Tab selectors */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 w-fit self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            📋 Scoped Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            📊 Scoped & Comparative Analytics
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'access' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            🛡️ Access Control & Defaulters
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Pipeline tracker (Conducted -> Scanned -> Evaluated -> Certified) */}
          <div className="bg-white dark:bg-slate-900 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm space-y-4">
            <h3 className="text-lg font-display font-medium text-zinc-900 dark:text-white">Regional Data Flow Pipeline</h3>
            <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm">
                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mb-1">1. Conducted</span>
                <span className="text-lg font-bold text-zinc-905 dark:text-white">{conductedExams} Exams</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm">
                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mb-1">2. Ingested (ICR)</span>
                <span className="text-lg font-bold text-zinc-905 dark:text-white">{ingestedSheets} Sheets</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm">
                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mb-1">3. Evaluated</span>
                <span className="text-lg font-bold text-indigo-755 dark:text-indigo-300">100% Scored</span>
              </div>
              <div className="p-4 bg-zinc-900 text-white rounded-lg border-none shadow-sm">
                <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">4. Certified FLN</span>
                <span className="text-lg font-bold text-green-400">{certifiedCount} Students</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* District rankings & lagging alerts */}
            <div className="bg-white dark:bg-slate-900 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm space-y-4">
              <h3 className="text-base font-display font-semibold text-zinc-900 dark:text-white">Regional Learning Gaps & Lagging Alerts</h3>
              <div className="space-y-3">
                {schoolPerformance.length === 0 ? (
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center py-6 font-mono">No preseeded schools found in this regional scope.</p>
                ) : (
                  schoolPerformance.map(perf => (
                    <div 
                      key={perf.schoolId} 
                      className={`flex justify-between items-center p-3 border rounded-lg ${
                        perf.isLagging 
                          ? 'border-red-100 dark:border-red-800 bg-red-50/50 dark:bg-red-950/50' 
                          : 'border-zinc-150 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'
                      }`}
                    >
                      <div>
                        <h5 className={`font-medium text-sm ${perf.isLagging ? 'text-red-900 dark:text-red-200' : 'text-zinc-900 dark:text-white'}`}>
                          {perf.schoolId} ({perf.name})
                        </h5>
                        <p className={`text-[10px] font-mono ${perf.isLagging ? 'text-red-600 dark:text-red-300' : 'text-zinc-400 dark:text-zinc-500'}`}>
                          {perf.deploymentMode}
                        </p>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                        perf.isLagging 
                          ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800' 
                          : 'text-zinc-700 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600'
                      }`}>
                        {perf.statusText}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Block oversight */}
            <div className="bg-white dark:bg-slate-900 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm space-y-4">
              <h3 className="text-base font-display font-semibold text-zinc-900 dark:text-white">Volunteer Assignments</h3>
              <div className="space-y-3">
                {scopedVolunteers.length === 0 ? (
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center py-6 font-mono">No active volunteers deployed in this regional node.</p>
                ) : (
                  scopedVolunteers.map(vol => (
                    <div key={vol.email} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg flex justify-between items-center bg-zinc-50 dark:bg-zinc-800">
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{vol.name}</div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          Assigned: {vol.assignedSchools.join(', ')}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 px-2.5 py-0.5 rounded border border-green-200 dark:border-green-800">
                        {vol.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <RegionalAnalyticsView token={token} user={user} />
      )}

      {activeTab === 'access' && (
        <div className="bg-white dark:bg-slate-900 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-display font-medium text-zinc-900 dark:text-white">School & Teacher Access Control</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Monitor Teacher delay attempts, suspensions, and manual school lockout restorations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schools Lockdown Monitoring */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-zinc-800 dark:text-zinc-100 text-xs uppercase font-mono border-b border-zinc-100 dark:border-zinc-800 pb-2">Schools Lock Status</h4>
              {scopedSchools.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">No schools found in scope.</p>
              ) : (
                scopedSchools.map(sch => {
                  const isLocked = sch.isAccessLocked;
                  const canRestore = [UserRole.SUPERADMIN, UserRole.ADMIN].includes(user.role);

                  const handleRestore = async () => {
                    try {
                      const res = await apiFetch('/api/admin/restore-school', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ schoolId: sch.id })
                      });
                      if (res.ok) {
                        alert(`School access restored for ${sch.name}.`);
                        // Refresh data
                        const schRes = await apiFetch('/api/schools', { headers: { 'Authorization': `Bearer ${token}` } });
                        const schData = await schRes.json();
                        if (Array.isArray(schData)) setSchools(schData);
                        
                        const uRes = await apiFetch('/api/admin/coordinators', { headers: { 'Authorization': `Bearer ${token}` } });
                        const uData = await uRes.json();
                        if (Array.isArray(uData)) setAllUsers(uData);
                      } else {
                        const err = await res.json();
                        alert(err.error || 'Failed to restore school access.');
                      }
                    } catch (e) {
                      alert('Connection failed.');
                    }
                  };

                  return (
                    <div key={sch.id} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg flex justify-between items-center bg-zinc-50 dark:bg-zinc-800">
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{sch.name}</div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">ID: {sch.id} · Teachers: {sch.teachersCount ?? 0}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isLocked 
                            ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
                            : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        }`}>
                          {isLocked ? 'LOCKED OUT' : 'ACTIVE'}
                        </span>
                        {isLocked && (
                          <button
                            disabled={!canRestore}
                            onClick={handleRestore}
                            className={`font-mono text-[9px] font-bold px-2 py-1 rounded shadow-sm border transition-colors ${
                              canRestore 
                                ? 'bg-white dark:bg-slate-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-zinc-400 cursor-pointer' 
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 cursor-not-allowed'
                            }`}
                            title={!canRestore ? 'Only State Admin / Superadmin can restore School access.' : ''}
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Teachers Banned / Suspended Tracking */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-zinc-800 dark:text-zinc-100 text-xs uppercase font-mono border-b border-zinc-100 dark:border-zinc-800 pb-2">Teacher Defaulters & Bans</h4>
              {allUsers.filter(u => u.role === UserRole.TEACHER && (user.role === UserRole.SUPERADMIN || (u.schoolId && scopedSchoolIds.includes(u.schoolId)))).length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">No teachers registered in this scope.</p>
              ) : (
                allUsers.filter(u => u.role === UserRole.TEACHER && (user.role === UserRole.SUPERADMIN || (u.schoolId && scopedSchoolIds.includes(u.schoolId)))).map(tch => {
                  const delays = tch.delayedAttemptsCount || 0;
                  const isSuspended = tch.isBanned;

                  const handleRevive = async () => {
                    try {
                      const res = await apiFetch('/api/admin/revive-teacher', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ teacherId: tch.id })
                      });
                      if (res.ok) {
                        alert(`Teacher ${tch.name} revived. Suspension released.`);
                        // Refresh data
                        const schRes = await apiFetch('/api/schools', { headers: { 'Authorization': `Bearer ${token}` } });
                        const schData = await schRes.json();
                        if (Array.isArray(schData)) setSchools(schData);
                        
                        const uRes = await apiFetch('/api/admin/coordinators', { headers: { 'Authorization': `Bearer ${token}` } });
                        const uData = await uRes.json();
                        if (Array.isArray(uData)) setAllUsers(uData);
                      } else {
                        const err = await res.json();
                        alert(err.error || 'Failed to revive teacher.');
                      }
                    } catch (e) {
                      alert('Connection failed.');
                    }
                  };

                  return (
                    <div key={tch.id} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg flex justify-between items-center bg-zinc-50 dark:bg-zinc-800">
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{tch.name} ({tch.email})</div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                          Delays: <strong className={delays > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-550 dark:text-zinc-400'}>{delays} / 3</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isSuspended 
                            ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
                            : 'text-zinc-650 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600'
                        }`}>
                          {isSuspended ? 'SUSPENDED' : 'NORMAL'}
                        </span>
                        {isSuspended && (
                          <button
                            onClick={handleRevive}
                            className="bg-white dark:bg-slate-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 font-mono text-[9px] font-bold px-2 py-1 rounded shadow-sm cursor-pointer transition-colors"
                          >
                            Revive
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 3. SCHOOL PRINCIPAL DASHBOARD
// ==========================================
export { SchoolDashboard } from './dashboards/SchoolDashboard';


// ==========================================
// 4. TEACHER DASHBOARD
// ==========================================
import { TeacherDashboard } from './dashboards/TeacherDashboard';
export { TeacherDashboard } from './dashboards/TeacherDashboard';


// ==========================================
// 5. VOLUNTEER DASHBOARD
// ==========================================
import { VolunteerDashboard } from './dashboards/VolunteerDashboard';
export { VolunteerDashboard } from './dashboards/VolunteerDashboard';

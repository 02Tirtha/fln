import { apiFetch, withBase } from '../services/apiClient';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole, Student, ClassGroup, School, LogEntry, Ticket } from '../types';
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

interface DashboardProps {
  user: User;
  token: string;
}

// ==========================================
// GEOGRAPHICAL COMPARATIVE ANALYTICS (SHARED VIEW)
// ==========================================
import { RegionalAnalyticsView } from './dashboards/RegionalAnalyticsView';
export { RegionalAnalyticsView } from './dashboards/RegionalAnalyticsView';

// ==========================================
// 1. SUPERADMIN (NATIONAL) DASHBOARD
// ==========================================
export const SuperadminDashboard: React.FC<DashboardProps> = ({ user, token }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coordinators' | 'analytics'>('overview');
  
  // Overview data
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<{ totalStudents: number; certifiedCount: number; certifiedPercent: number; avgFlnLevel: number; [key: string]: any } | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Coordinator creation state
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordPass, setCoordPass] = useState('');
  const [coordRole, setCoordRole] = useState<UserRole>(UserRole.ADMIN);
  const [coordState, setCoordState] = useState('PB');
  const [coordDistrict, setCoordDistrict] = useState('');
  const [coordBlock, setCoordBlock] = useState('');
  const [coordSchoolId, setCoordSchoolId] = useState('');
  const [coordAssignedSchoolsStr, setCoordAssignedSchoolsStr] = useState('');
  const [coordSuccess, setCoordSuccess] = useState('');
  const [coordError, setCoordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coordinatorsList, setCoordinatorsList] = useState<User[]>([]);

  // School onboarding state
  const [newSchoolId, setNewSchoolId] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolState, setNewSchoolState] = useState('PB');
  const [newSchoolDistrict, setNewSchoolDistrict] = useState('');
  const [newSchoolBlock, setNewSchoolBlock] = useState('');
  const [newSchoolStrength, setNewSchoolStrength] = useState<'high' | 'low'>('low');
  const [schoolSuccess, setSchoolSuccess] = useState('');
  const [schoolError, setSchoolError] = useState('');

  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');

  const stateFilterOptions = useMemo(() => {
    return Array.from(new Set(coordinatorsList.map(c => c.stateCode).filter(Boolean)))
      .sort();
  }, [coordinatorsList]);

  const districtFilterOptions = useMemo(() => {
    return Array.from(new Set(
      coordinatorsList
        .filter(c => !stateFilter || c.stateCode === stateFilter)
        .map(c => c.districtCode)
        .filter(Boolean)
    )).sort();
  }, [coordinatorsList, stateFilter]);

  const schoolFilterOptions = useMemo(() => {
    return Array.from(new Set(
      coordinatorsList
        .filter(c => (!stateFilter || c.stateCode === stateFilter) && (!districtFilter || c.districtCode === districtFilter))
        .map(c => c.schoolId)
        .filter(Boolean)
    )).sort();
  }, [coordinatorsList, stateFilter, districtFilter]);

  const filteredCoordinators = useMemo(() => {
    return coordinatorsList.filter(c => {
      if (stateFilter && c.stateCode !== stateFilter) return false;
      if (districtFilter && c.districtCode !== districtFilter) return false;
      if (schoolFilter && c.schoolId !== schoolFilter) return false;
      return true;
    });
  }, [coordinatorsList, stateFilter, districtFilter, schoolFilter]);

  const schoolNameById = useMemo(() => {
    return schools.reduce<Record<string, string>>((map, school) => {
      map[school.id] = school.name;
      return map;
    }, {});
  }, [schools]);

  const resetCoordinatorFilters = () => {
    setStateFilter('');
    setDistrictFilter('');
    setSchoolFilter('');
  };

  const fetchGlobalData = async () => {
    try {
      const schRes = await apiFetch('/api/schools', { headers: { 'Authorization': `Bearer ${token}` } });
      const schData = await schRes.json();
      if (Array.isArray(schData)) setSchools(schData);

      const statsRes = await apiFetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const res = await apiFetch('/api/admin/coordinators', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setCoordinatorsList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    fetchCoordinators();
  }, [token]);

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMsg) return;
    try {
      const res = await apiFetch('/api/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: announcementTitle, message: announcementMsg, isUrgent })
      });
      if (res.ok) {
        setSuccessMsg('Announcement broadcasted and escalated to email channels successfully!');
        setAnnouncementTitle('');
        setAnnouncementMsg('');
        setIsUrgent(false);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (_) {}
  };

  const handleCreateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoordError('');
    setCoordSuccess('');
    setLoading(true);

    const assignedSchools = coordAssignedSchoolsStr
      ? coordAssignedSchoolsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : undefined;

    try {
      const res = await apiFetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: coordName,
          email: coordEmail,
          password: coordPass,
          role: coordRole,
          stateCode: coordState,
          districtCode: coordDistrict,
          blockCode: coordBlock,
          schoolId: [UserRole.SCHOOL, UserRole.TEACHER].includes(coordRole) ? coordSchoolId : undefined,
          assignedSchools: coordRole === UserRole.VOLUNTEER ? assignedSchools : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCoordSuccess(`Successfully created account: ${coordName} (${coordRole})`);
        setCoordName('');
        setCoordEmail('');
        setCoordPass('');
        setCoordDistrict('');
        setCoordBlock('');
        setCoordSchoolId('');
        setCoordAssignedSchoolsStr('');
        await fetchCoordinators();
        
        // Refresh school data
        const schRes = await apiFetch('/api/schools', { headers: { 'Authorization': `Bearer ${token}` } });
        const schData = await schRes.json();
        if (Array.isArray(schData)) setSchools(schData);

        setTimeout(() => setCoordSuccess(''), 6000);
      } else {
        setCoordError(data.error || 'Failed to register account.');
      }
    } catch (err) {
      setCoordError('Network error. Check connection settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolError('');
    setSchoolSuccess('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: newSchoolId,
          name: newSchoolName,
          stateCode: newSchoolState,
          districtCode: newSchoolDistrict,
          blockCode: newSchoolBlock,
          strength: newSchoolStrength
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSchoolSuccess(`Successfully onboarded school: ${newSchoolName} (${newSchoolId.toUpperCase()})`);
        setNewSchoolId('');
        setNewSchoolName('');
        setNewSchoolDistrict('');
        setNewSchoolBlock('');
        // Refresh school list
        const schRes = await apiFetch('/api/schools', { headers: { 'Authorization': `Bearer ${token}` } });
        const schData = await schRes.json();
        if (Array.isArray(schData)) setSchools(schData);
        setTimeout(() => setSchoolSuccess(''), 6000);
      } else {
        setSchoolError(data.error || 'Failed to onboard school.');
      }
    } catch (err) {
      setSchoolError('Network error. Check connection settings.');
    } finally {
      setLoading(false);
    }
  };

  // Password complexity live checks
  const isPassLengthValid = coordPass.length >= 8;
  const isPassUppercaseValid = /[A-Z]/.test(coordPass);
  const isPassNumberValid = /[0-9]/.test(coordPass);
  const isPassSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(coordPass);

  return (
    <div className="space-y-6" id="superadmin-dashboard">
      <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white tracking-tight">National Oversight Center</h1>
          <p className="text-zinc-505 dark:text-zinc-400 text-sm mt-0.5">IIT Ropar / Vicharanashala Lab · Global Curriculum Master Controls</p>
        </div>

        {/* Dashboard Tabs Selector */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 w-fit self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            📋 Overview
          </button>
          <button
            onClick={() => setActiveTab('coordinators')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'coordinators' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            👤 Coordinator Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            📊 Geographical Analytics
          </button>
        </div>

        {/* DB Reset for easy demo */}
        <button
          onClick={async () => {
            if (!window.confirm('Reset all database data to fresh seed state? This is irreversible.')) return;
            await apiFetch('/api/reset', { method: 'POST' });
            window.location.reload();
          }}
          className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
        >
          🔄 Reset Database
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <SuperAdminExecutiveDashboard user={user} token={token} />

          {/* Global Announcement Drawer */}
          <div className="bg-white dark:bg-slate-900 p-6 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <span>📣 Post Global Announcement & Email Escalate</span>
            </h3>
            <form onSubmit={postAnnouncement} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement title..."
                  className="w-full text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 bg-white dark:bg-slate-900 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Message Content</label>
                <input
                  type="text"
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="Broadcast message details..."
                  className="w-full text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 bg-white dark:bg-slate-900 text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-1 flex flex-col justify-end gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded border-zinc-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-[11px] text-red-600 font-bold uppercase font-mono">Urgent Email</span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Broadcast
                </button>
              </div>
            </form>
            {successMsg && <div className="mt-3 p-2 text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-xl border border-green-200">{successMsg}</div>}
          </div>
        </div>
      )}


      {activeTab === 'coordinators' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin registration form */}
          <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="text-lg font-display font-medium text-zinc-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-zinc-500" />
              <span>Register New Coordinator</span>
            </h3>

            {coordSuccess && <div className="p-3 text-xs bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded border border-green-200 dark:border-green-800">{coordSuccess}</div>}
            {coordError && <div className="p-3 text-xs bg-red-50 dark:bg-red-950 text-red-850 dark:text-red-200 rounded border border-red-200 dark:border-red-800">{coordError}</div>}

            <form onSubmit={handleCreateCoordinator} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={coordName}
                  onChange={e => setCoordName(e.target.value)}
                  placeholder="e.g. Dr. Satnam Singh"
                  required
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 bg-zinc-50 dark:bg-zinc-800 outline-none focus:bg-white dark:focus:bg-zinc-700 focus:border-zinc-500 font-medium text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email Identifier</label>
                <input
                  type="email"
                  value={coordEmail}
                  onChange={e => setCoordEmail(e.target.value)}
                  placeholder="e.g. s.singh@pb.fln.org"
                  required
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 bg-zinc-50 dark:bg-zinc-800 outline-none focus:bg-white dark:focus:bg-zinc-700 focus:border-zinc-500 font-medium text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Account Password</label>
                <input
                  type="password"
                  value={coordPass}
                  onChange={e => setCoordPass(e.target.value)}
                  placeholder="Create complex password..."
                  required
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 bg-zinc-50 dark:bg-zinc-800 outline-none focus:bg-white dark:focus:bg-zinc-700 focus:border-zinc-500 font-medium text-zinc-900 dark:text-white"
                />
                
                {/* Real-time complexity checklist (§3.2 A-3) */}
                <div className="mt-2.5 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold block">Password SLA Checks</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                    <span className="flex items-center gap-1">
                      {isPassLengthValid ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                      <span className={isPassLengthValid ? 'text-green-700' : 'text-zinc-550'}>&gt;= 8 Characters</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {isPassUppercaseValid ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                      <span className={isPassUppercaseValid ? 'text-green-700' : 'text-zinc-550'}>1 Uppercase</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {isPassNumberValid ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                      <span className={isPassNumberValid ? 'text-green-700' : 'text-zinc-550'}>1 Numeric Digit</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {isPassSpecialValid ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-zinc-300" />}
                      <span className={isPassSpecialValid ? 'text-green-700' : 'text-zinc-550'}>1 Symbol (!@#...)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Administrative Role Tier</label>
                <select
                  value={coordRole}
                  onChange={e => {
                    const selectedRole = e.target.value as UserRole;
                    setCoordRole(selectedRole);
                    if (selectedRole === UserRole.ADMIN) {
                      setCoordDistrict('');
                      setCoordBlock('');
                    } else if (selectedRole === UserRole.DISTRICT_ADMIN) {
                      setCoordBlock('');
                    }
                  }}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 bg-zinc-50 dark:bg-zinc-800 outline-none focus:bg-white dark:focus:bg-zinc-700 font-medium text-zinc-850 dark:text-zinc-100"
                >
                  <option value={UserRole.ADMIN}>State Admin / Coordinator</option>
                  <option value={UserRole.DISTRICT_ADMIN}>District Admin / Officer</option>
                  <option value={UserRole.BLOCK_ADMIN}>Block Admin / Supervisor</option>
                  <option value={UserRole.SCHOOL}>School Principal</option>
                  <option value={UserRole.TEACHER}>Teacher</option>
                  <option value={UserRole.VOLUNTEER}>Volunteer</option>
                </select>
              </div>

              {/* Scope nodes triggers dynamically depending on role */}
              {![UserRole.SCHOOL, UserRole.TEACHER, UserRole.VOLUNTEER].includes(coordRole) && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-0.5">State Code</label>
                    <input
                       type="text"
                       value={coordState}
                       onChange={e => setCoordState(e.target.value.toUpperCase())}
                       placeholder="e.g. PB"
                       required
                       className="w-full text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800 outline-none font-medium text-zinc-800 dark:text-zinc-200"
                     />
                   </div>
                   
                   {coordRole !== UserRole.ADMIN && (
                     <div>
                       <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-0.5">District Code</label>
                       <input
                         type="text"
                         value={coordDistrict}
                         onChange={e => setCoordDistrict(e.target.value.toUpperCase())}
                         placeholder="e.g. LDH"
                         required
                         className="w-full text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800 outline-none font-medium text-zinc-800 dark:text-zinc-200"
                       />
                     </div>
                   )}

                   {coordRole === UserRole.BLOCK_ADMIN && (
                     <div>
                       <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Block Code</label>
                       <input
                         type="text"
                         value={coordBlock}
                         onChange={e => setCoordBlock(e.target.value.toUpperCase())}
                         placeholder="e.g. LDH-01"
                         required
                         className="w-full text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800 outline-none font-medium text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* School scope text input for School and Teacher roles */}
              {[UserRole.SCHOOL, UserRole.TEACHER].includes(coordRole) && (
                <div>
                   <label className="block text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Assigned School ID</label>
                   <input
                     type="text"
                     value={coordSchoolId}
                     onChange={e => setCoordSchoolId(e.target.value)}
                     placeholder="e.g. gps-vl-002"
                     required
                     className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 bg-zinc-50 dark:bg-zinc-800 outline-none focus:bg-white dark:focus:bg-zinc-700 font-medium text-zinc-800 dark:text-zinc-100"
                   />
                 </div>
               )}

               {/* Comma-separated school IDs for Volunteers */}
               {coordRole === UserRole.VOLUNTEER && (
                 <div>
                   <label className="block text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Assigned School IDs (Comma Separated)</label>
                   <input
                     type="text"
                     value={coordAssignedSchoolsStr}
                     onChange={e => setCoordAssignedSchoolsStr(e.target.value)}
                     placeholder="e.g. gps-vl-002, gps-jai-004"
                     required
                     className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 bg-zinc-50 dark:bg-zinc-800 outline-none focus:bg-white dark:focus:bg-zinc-700 font-medium text-zinc-800 dark:text-zinc-100"
                   />
                 </div>
               )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 font-medium text-sm py-2.5 px-4 rounded-lg cursor-pointer shadow-sm transition-colors mt-2 text-center block font-mono"
              >
                {loading ? 'Registering...' : 'Provision Account'}
              </button>
            </form>
          </div>

          {/* Coordinators lists */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3 justify-between">
              <div>
                <h3 className="text-lg font-display font-medium text-zinc-900 dark:text-white">Registered Coordinators Index</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Filter coordinator records by state, district, and school.</p>
              </div>
              <button
                onClick={resetCoordinatorFilters}
                className="text-xs font-semibold text-indigo-700 hover:underline"
              >
                Reset filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => {
                    setStateFilter(e.target.value);
                    setDistrictFilter('');
                    setSchoolFilter('');
                  }}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                >
                  <option value="">All states</option>
                  {stateFilterOptions.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">District</label>
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setSchoolFilter('');
                  }}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                >
                  <option value="">All districts</option>
                  {districtFilterOptions.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">School</label>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
                >
                  <option value="">All schools</option>
                  {schoolFilterOptions.map(id => (
                    <option key={id} value={id}>{schoolNameById[id] ? `${schoolNameById[id]} (${id})` : id}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

            {(() => {
              const coordinatorColumns: Column<User>[] = [
                { header: 'Coordinator Name', accessor: 'name', sortKey: 'name', className: 'font-semibold text-slate-900 dark:text-slate-100' },
                { header: 'Email', accessor: 'email', sortKey: 'email', className: 'font-mono text-slate-500 dark:text-slate-400' },
                {
                  header: 'Role Tier',
                  accessor: (c) => (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      c.role === UserRole.SUPERADMIN ? 'bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900' : c.role === UserRole.ADMIN ? 'bg-indigo-105 text-indigo-850 dark:bg-indigo-950 dark:text-indigo-200' : c.role === UserRole.DISTRICT_ADMIN ? 'bg-emerald-105 text-emerald-850 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-amber-105 text-amber-855 dark:bg-amber-950 dark:text-amber-200'
                    }`}>
                      {c.role}
                    </span>
                  )
                },
                {
                  header: 'Assigned Scope Nodes',
                  accessor: (c) => {
                    let nodeScope = '';
                    if (c.role === UserRole.SUPERADMIN) {
                      nodeScope = 'National (Global)';
                    } else if (c.role === UserRole.ADMIN) {
                      nodeScope = `State: ${c.stateCode || 'N/A'}`;
                    } else if (c.role === UserRole.DISTRICT_ADMIN) {
                      nodeScope = `State: ${c.stateCode || 'N/A'} / District: ${c.districtCode || 'N/A'}`;
                    } else if (c.role === UserRole.BLOCK_ADMIN) {
                      nodeScope = `State: ${c.stateCode || 'N/A'} / Dist: ${c.districtCode || 'N/A'} / Block: ${c.blockCode || 'N/A'}`;
                    } else if (c.role === UserRole.SCHOOL || c.role === UserRole.TEACHER) {
                      const sch = schools.find(s => s.id === c.schoolId);
                      if (sch) {
                        nodeScope = `State: ${sch.stateCode} / Dist: ${sch.districtCode} / Block: ${sch.blockCode} (${sch.name})`;
                      } else {
                        nodeScope = `School ID: ${c.schoolId || 'N/A'}`;
                      }
                    } else if (c.role === UserRole.VOLUNTEER) {
                      const firstSchId = c.assignedSchools?.[0];
                      const sch = firstSchId ? schools.find(s => s.id === firstSchId) : undefined;
                      if (sch) {
                        nodeScope = `State: ${sch.stateCode} / Dist: ${sch.districtCode} / Block: ${sch.blockCode} (${sch.name})`;
                      } else if (c.assignedSchools && c.assignedSchools.length > 0) {
                        nodeScope = `Schools: ${c.assignedSchools.join(', ')}`;
                      } else {
                        nodeScope = 'No schools assigned';
                      }
                    } else {
                      nodeScope = `State: ${c.stateCode || 'N/A'} / Dist: ${c.districtCode || 'N/A'} / Block: ${c.blockCode || 'N/A'}`;
                    }
                    return <span className="font-medium text-slate-700 dark:text-slate-200">{nodeScope}</span>;
                  }
                }
              ];
              return (
                <Table data={filteredCoordinators} columns={coordinatorColumns} searchPlaceholder="Search coordinators..." searchKey="name" />
              );
            })()}
          </div>

        </div>
      )}

      {activeTab === 'analytics' && (
        <RegionalAnalyticsView token={token} user={user} />
      )}
    </div>
  );
};


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
export const SchoolDashboard: React.FC<DashboardProps> = ({ user, token }) => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeClass, setActiveClass] = useState<ClassGroup | null>(null);

  const fetchSchoolData = async () => {
    try {
      const clsRes = await apiFetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } });
      const clsData = await clsRes.json();
      if (Array.isArray(clsData)) setClasses(clsData);

      const stdRes = await apiFetch('/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
      const stdData = await stdRes.json();
      if (Array.isArray(stdData)) setStudents(stdData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchoolData();
  }, [token]);

  if (activeClass) {
    const classStudents = students.filter(s => s.classGroup === activeClass.className && s.section === activeClass.section);
    return (
      <WorksheetWorkflow
        classGroup={activeClass}
        students={classStudents}
        token={token}
        userRole={user.role}
        onBack={() => {
          setActiveClass(null);
          fetchSchoolData();
        }}
      />
    );
  }

  return (
    <div className="space-y-6" id="school-dashboard">
      <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
        <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white tracking-tight">School Administration</h1>
        <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-0.5">GPS Model Town Ludhiana (ID: {user.schoolId})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classes grid */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-display font-medium text-zinc-900 dark:text-white">Assigned Classroom Roster</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map(c => {
              const count = students.filter(s => s.classGroup === c.className && s.section === c.section).length;
              return (
                <div key={c.id} className="bg-white dark:bg-slate-900 p-5 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm space-y-4 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-zinc-900 dark:text-white text-lg">{c.className} - {c.section}</h4>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{count} Active Students Registered</p>
                  </div>
                  <button
                    onClick={() => setActiveClass(c)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-medium text-xs py-2 rounded transition-colors"
                  >
                    Manage Worksheets & locks
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Learning suggestions */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm space-y-4 h-fit">
          <h3 className="text-base font-display font-semibold text-zinc-900 dark:text-white">AI Concept-Focus Suggestions</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Derived automatically from class evaluations compiled across standard assessment cycles.
          </p>
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300 font-bold">Patterns Mastery: Needs Practice</span>
              <p className="text-zinc-700 dark:text-zinc-200 text-xs">Class 2 is struggling with multi-step sequence patterns. Recommend tracing visual lessons.</p>
            </div>
            <div className="p-3 bg-green-50/50 dark:bg-green-950/50 border border-green-100 dark:border-green-900 rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-green-700 dark:text-green-300 font-bold">Number Sense: Strong</span>
              <p className="text-zinc-700 dark:text-zinc-200 text-xs">Class 3 has completed addition targets, ready to progress to simple fractions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


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

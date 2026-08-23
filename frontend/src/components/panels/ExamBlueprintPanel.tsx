import React, { useEffect, useState } from 'react';
import { PageHeader } from './PanelShared';
import { Database, Plus, Search, Trash2, Edit2, Sliders } from 'lucide-react';

interface ExamBlueprintPanelProps {
  token: string;
}

export const ExamBlueprintPanel: React.FC<ExamBlueprintPanelProps> = ({ token }) => {
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [blueprintSearch, setBlueprintSearch] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [bpFormData, setBpFormData] = useState({
    examId: '',
    examName: '',
    questionNumber: 1,
    conceptName: '',
    type: 'numeric',
    template: '',
    engineData: '{}'
  });

  const fetchBlueprints = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/blueprints', { headers });
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        setBlueprints(d.data);
      }
    } catch (err) {
      console.error('Failed to fetch blueprints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, [token]);

  const handleSaveBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedEngineData = {};
      try {
        parsedEngineData = JSON.parse(bpFormData.engineData);
      } catch (err) {
        alert('Invalid JSON in Engine Configuration');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const method = editingBlueprint ? 'PUT' : 'POST';
      const url = editingBlueprint
        ? `/api/blueprints/${editingBlueprint.id}`
        : '/api/blueprints';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...bpFormData,
          engineData: parsedEngineData
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchBlueprints();
        setShowBlueprintModal(false);
        setEditingBlueprint(null);
        setBpFormData({
          examId: '',
          examName: '',
          questionNumber: 1,
          conceptName: '',
          type: 'numeric',
          template: '',
          engineData: '{}'
        });
      } else {
        alert(data.error || 'Failed to save blueprint');
      }
    } catch (err) {
      console.error(err);
      alert('Save operation failed.');
    }
  };

  const handleEditBlueprint = (bp: any) => {
    setEditingBlueprint(bp);
    setBpFormData({
      examId: bp.examId,
      examName: bp.examName,
      questionNumber: bp.questionNumber,
      conceptName: bp.conceptName,
      type: bp.type,
      template: bp.template,
      engineData: JSON.stringify(bp.engineData, null, 2)
    });
    setShowBlueprintModal(true);
  };

  const handleDeleteBlueprint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blueprint rule?')) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`/api/blueprints/${id}`, {
        method: 'DELETE',
        headers
      });
      const d = await res.json();
      if (d.success) {
        fetchBlueprints();
      } else {
        alert(d.error || 'Failed to delete blueprint');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic
  const uniqueExams = Array.from(new Set(blueprints.map(b => b.examId)));
  const filteredBlueprints = blueprints.filter(b => {
    const matchesSearch = b.examName?.toLowerCase().includes(blueprintSearch.toLowerCase()) ||
      b.conceptName?.toLowerCase().includes(blueprintSearch.toLowerCase()) ||
      b.examId?.toLowerCase().includes(blueprintSearch.toLowerCase());
    const matchesExam = selectedExamFilter === 'all' || b.examId === selectedExamFilter;
    return matchesSearch && matchesExam;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="Exam Blueprints"
          desc="Map diagnostic & worksheet questions to remediation generation rules and templates"
          icon={<Database className="h-5 w-5 text-indigo-600" />}
        />
        <button
          onClick={() => {
            setEditingBlueprint(null);
            setBpFormData({
              examId: '',
              examName: '',
              questionNumber: 1,
              conceptName: '',
              type: 'numeric',
              template: '',
              engineData: '{}'
            });
            setShowBlueprintModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm self-start transition-all"
        >
          <Plus className="w-4 h-4" /> Add Blueprint Rule
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by exam, concept, or tag..."
            value={blueprintSearch}
            onChange={e => setBlueprintSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedExamFilter}
            onChange={e => setSelectedExamFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-808 text-slate-900 dark:text-white min-w-[150px]"
          >
            <option value="all">All Assessments</option>
            {uniqueExams.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Blueprints Table */}
      {loading ? (
        <div className="text-center py-8 text-sm text-slate-500">Loading blueprints...</div>
      ) : filteredBlueprints.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400">
          <Sliders className="w-8 h-8 mx-auto mb-2 text-slate-350" />
          <p className="text-sm">No blueprint rules found matching your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase">
                <th className="px-4 py-3">Assessment ID</th>
                <th className="px-4 py-3">Assessment Name</th>
                <th className="px-4 py-3 text-center">QNo</th>
                <th className="px-4 py-3">Concept / Topic</th>
                <th className="px-4 py-3">Engine Type</th>
                <th className="px-4 py-3">Template Expression</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBlueprints.map((bp: any) => (
                <tr key={bp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-650 dark:text-slate-400">{bp.examId}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{bp.examName}</td>
                  <td className="px-4 py-3 text-center font-bold">{bp.questionNumber}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{bp.conceptName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      bp.type === 'generative' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300' 
                        : bp.type === 'matrix'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300'
                    }`}>
                      {bp.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={bp.template}>
                    {bp.template}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleEditBlueprint(bp)}
                        className="p-1.5 text-slate-500 hover:text-indigo-650 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlueprint(bp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blueprint Add/Edit Modal */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingBlueprint ? 'Edit Question Rule Blueprint' : 'Register New Question Rule'}
              </h3>
              <button
                onClick={() => setShowBlueprintModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBlueprint} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exam ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. exam_baseline_class2"
                    value={bpFormData.examId}
                    onChange={e => setBpFormData({ ...bpFormData, examId: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exam Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 2 Baseline Assessment"
                    value={bpFormData.examName}
                    onChange={e => setBpFormData({ ...bpFormData, examName: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question Number</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bpFormData.questionNumber}
                    onChange={e => setBpFormData({ ...bpFormData, questionNumber: Number(e.target.value) })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Concept Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Single-digit addition"
                    value={bpFormData.conceptName}
                    onChange={e => setBpFormData({ ...bpFormData, conceptName: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Engine Type</label>
                <select
                  value={bpFormData.type}
                  onChange={e => {
                    const newType = e.target.value;
                    let defaultData = '{}';
                    if (newType === 'numeric') {
                      defaultData = '{\n  "rangeStart": 1,\n  "rangeEnd": 100\n}';
                    } else if (newType === 'matrix') {
                      defaultData = '{\n  "wordList": ["cat", "dog", "rat", "pig"]\n}';
                    } else if (newType === 'generative') {
                      defaultData = '{\n  "prompt": "generate a reading concept question",\n  "topic": "Addition"\n}';
                    }
                    setBpFormData({ ...bpFormData, type: newType, engineData: defaultData });
                  }}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="numeric">Numeric (number shuffling)</option>
                  <option value="matrix">Matrix (word selection)</option>
                  <option value="generative">Generative (AI/Gemini generation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template Sentence</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is {0} + {1}?"
                  value={bpFormData.template}
                  onChange={e => setBpFormData({ ...bpFormData, template: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Use placeholder blanks like {`{0}`}, {`{1}`} which will be replaced by the engine.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Engine Configuration (JSON)</label>
                <textarea
                  required
                  rows={4}
                  value={bpFormData.engineData}
                  onChange={e => setBpFormData({ ...bpFormData, engineData: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlueprintModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

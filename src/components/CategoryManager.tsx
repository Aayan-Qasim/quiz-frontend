import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Edit2, Merge, X, RefreshCw, AlertCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api.js';

interface CategoryItem {
  name: string;
  questionCount: number;
  customCount: number;
}

interface CategoryManagerProps {
  token: string | null;
}

export function CategoryManager({ token }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Category creator state
  const [newCatName, setNewCatName] = useState('');
  const [creatorMsg, setCreatorMsg] = useState<string | null>(null);

  // Modal active item
  const [activeItem, setActiveItem] = useState<CategoryItem | null>(null);
  const [operationType, setOperationType] = useState<'rename' | 'merge' | null>(null);
  const [targetName, setTargetName] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const questionsList = await api.getQuestions(undefined, undefined, token);
      const distinctNames = await api.getCategories(token);
      
      const parsedItems = distinctNames.map((name: string) => {
        const catQs = questionsList.filter((q: any) => q.category.toLowerCase() === name.toLowerCase());
        const customCount = catQs.filter((q: any) => q.isCustom).length;
        return {
          name,
          questionCount: catQs.length,
          customCount
        };
      });

      setCategories(parsedItems);
    } catch (err: any) {
      setError(err.message || 'Internal connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorMsg(null);
    const cleaned = newCatName.trim();
    if (!cleaned) return;

    // Check if category exists
    const match = categories.find(c => c.name.toLowerCase() === cleaned.toLowerCase());
    if (match) {
      setCreatorMsg('That category topic already exists in the trivia database.');
      return;
    }

    try {
      await api.saveQuestion({
        category: cleaned,
        questionText: `Seeded sample question for ${cleaned}. Edit this later!`,
        optionA: 'Option A sample',
        optionB: 'Option B sample',
        optionC: 'Option C sample',
        optionD: 'Option D sample',
        correctAnswer: 'A',
        explanation: 'System auto-seeded record for category initialization.'
      }, token);

      setNewCatName('');
      setCreatorMsg(`Category topic "${cleaned}" initialized with 1 placeholder sample.`);
      fetchCategories();
    } catch (err: any) {
      setCreatorMsg(`Error: ${err.message}`);
    }
  };

  const handleExecuteOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !operationType || !targetName.trim()) return;

    try {
      await api.saveCategoryOperation(activeItem.name, targetName.trim(), 'rename', token);

      setActiveItem(null);
      setOperationType(null);
      setTargetName('');
      setModalError(null);
      fetchCategories();
    } catch (err: any) {
      setModalError(err.message || 'Request failure');
    }
  };

  const openActionDialog = (item: CategoryItem, type: 'rename' | 'merge') => {
    setActiveItem(item);
    setOperationType(type);
    setTargetName(type === 'rename' ? item.name : '');
    setModalError(null);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Category Management
          </h1>
          <p className="text-xs text-slate-500">
            Monitor, rename, add, or merge topic segments in the database cache.
          </p>
        </div>
        <button
          onClick={fetchCategories}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 bg-white rounded hover:bg-slate-50 text-[10.5px] font-bold shadow-sm cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Rebuild Census
        </button>
      </div>

      {/* QUICK WORKSPACE INITIALIZER FORM */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5 flex-1">
          <h3 className="text-xs font-bold text-slate-805 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Quickly Initialize New Category Segment
          </h3>
          <p className="text-[11px] text-slate-400">
            Will automatically seed a temporary custom review question under the category so it joins the indexing pipeline immediately.
          </p>
        </div>

        <form onSubmit={handleAddNewCategory} className="space-y-1.5 w-full md:max-w-xs shrink-0">
          <div className="flex gap-1.5">
            <input
              type="text"
              required
              placeholder="e.g. Current Affairs"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs flex-1 text-slate-705 placeholder-slate-400 focus:outline-none focus:border-indigo-505 focus:bg-white"
            />
            <button
               type="submit"
              className="px-3 py-1.5 bg-indigo-650 hover:bg-slate-800 text-white rounded text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Initialize Topic
            </button>
          </div>
          {creatorMsg && (
            <p className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 leading-tight p-1.5 rounded">
              {creatorMsg}
            </p>
          )}
        </form>
      </div>

      {/* CATEGORIES CENSUS DASHBOARD LIST */}
      <div>
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-440 font-medium">
            Enumerating current question aggregates...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded text-xs">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs text-center text-slate-400 py-10">Zero categories available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-350 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                      <Layers className="h-3.5 w-3.5 text-indigo-550 shrink-0" />
                      {cat.name}
                    </h3>
                  </div>
                  
                  <div className="flex justify-start gap-3 text-[11px] text-slate-500 pt-1.5">
                    <div>
                      Questions: <strong className="text-slate-700 font-bold font-mono">{cat.questionCount}</strong>
                    </div>
                    {cat.customCount > 0 && (
                      <div>
                        Custom: <strong className="text-emerald-600 font-bold font-mono">{cat.customCount}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations tools */}
                <div className="grid grid-cols-2 gap-1.5 mt-3.5 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => openActionDialog(cat, 'rename')}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 border border-slate-205 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 rounded text-[10px] font-bold text-slate-600 cursor-pointer transition-colors"
                  >
                    <Edit2 className="h-3 w-3 text-slate-400" />
                    Rename
                  </button>
                  <button
                    onClick={() => openActionDialog(cat, 'merge')}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 border border-slate-205 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 rounded text-[10px] font-bold text-slate-600 cursor-pointer transition-colors"
                  >
                    <Merge className="h-3 w-3 text-slate-400" />
                    Merge Topic
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* OPERATIONS DIALOG DRAWER */}
      <AnimatePresence>
        {activeItem && operationType && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg max-w-sm w-full border border-slate-200"
            >
              <div className="px-4 py-3 border-b border-slate-150 flex justify-between items-center bg-slate-50 rounded-t-lg">
                <h3 className="text-xs font-bold text-slate-700 capitalize flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-indigo-650" />
                  {operationType === 'rename' ? 'Rename Category' : 'Merge Categories'}
                </h3>
                <button onClick={() => {
                  setActiveItem(null);
                  setOperationType(null);
                  setTargetName('');
                }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <form onSubmit={handleExecuteOperation} className="p-4 space-y-3 font-sans">
                {modalError && (
                  <div className="bg-rose-50 text-rose-700 p-2.5 rounded border border-rose-150 flex items-center gap-1.5 leading-none text-[10px]">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}
                {operationType === 'rename' ? (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      This will swap out the category tag name <strong>"{activeItem.name}"</strong> value dynamically inside all <span className="font-mono">{activeItem.questionCount}</span> matching question models across the database.
                    </p>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mt-2.5">Target / New Name</label>
                    <input
                      type="text"
                      required
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      placeholder="e.g. Science & Physics"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-705 focus:outline-none focus:border-indigo-501 focus:bg-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Move all <span className="font-mono">{activeItem.questionCount}</span> questions from <strong>"{activeItem.name}"</strong> directly into another existing category tags group. The category <strong>"{activeItem.name}"</strong> selection will melt/disappear on empty indices.
                    </p>

                    <div className="bg-amber-50 p-2.5 rounded border border-amber-100 text-[10px] text-amber-700 font-semibold flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-550" />
                      <span>Warning: This merges all objective scores and questions. Operation is irreversible.</span>
                    </div>

                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wide mt-3">Select Target Destination Category</label>
                    <select
                      required
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">Choose Category...</option>
                      {categories
                        .filter(item => item.name !== activeItem.name)
                        .map((item, idx) => (
                          <option key={idx} value={item.name}>{item.name}</option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-1.5 justify-end pt-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveItem(null);
                      setOperationType(null);
                      setTargetName('');
                    }}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded bg-white hover:bg-slate-50 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-650 text-white rounded text-xs font-bold hover:bg-indigo-755 shadow-sm cursor-pointer"
                  >
                    {operationType === 'rename' ? 'Apply Rename' : 'Perform Merge'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

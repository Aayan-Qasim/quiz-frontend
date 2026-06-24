import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Trash2, Edit, Check, Upload, HelpCircle, Filter, X, ShieldAlert, Star, BookOpen, 
  AlertCircle, FileSpreadsheet, ArrowLeft, LayoutGrid, Award, Folder, ArrowUpRight, ArrowDownRight,
  Sparkles, Flame, Clock, Users, Database
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine 
} from 'recharts';
import * as XLSX from 'xlsx';
import { Question } from '../types.js';
import { api } from '../utils/api.js';

interface QuestionManagerProps {
  token: string | null;
}

export function QuestionManager({ token }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layout View State
  const [isViewingQuestions, setIsViewingQuestions] = useState<boolean>(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCustomFilter, setIsCustomFilter] = useState<string>('all'); // 'all', 'seeded', 'custom'

  // Categories list collected dynamically
  const [categories, setCategories] = useState<string[]>([]);

  // CRUD Form Dialog Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields State
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');

  // Inline deletion confirmation state to avoid window.confirm iframe blocks
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Clear confirmation dialog state
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Excel Import state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importingFile, setImportingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chartTimeframe, setChartTimeframe] = useState<'day' | 'week' | 'month'>('day');

  const [categoryCountMap, setCategoryCountMap] = useState<Record<string, number>>({});
  const [totalQuestionsGlobal, setTotalQuestionsGlobal] = useState<number>(0);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const isCustomVal = isCustomFilter === 'custom' ? true : isCustomFilter === 'seeded' ? false : undefined;
      let list = await api.getQuestions(selectedCategory || undefined, isCustomVal, token);

      const allQs = await api.getQuestions(undefined, undefined, token);
      setTotalQuestionsGlobal(allQs.length);
      
      const counts: Record<string, number> = {};
      allQs.forEach((q: Question) => {
        counts[q.category] = (counts[q.category] || 0) + 1;
      });
      setCategoryCountMap(counts);

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        list = list.filter((q: Question) => 
          q.questionText.toLowerCase().includes(query) ||
          q.optionA.toLowerCase().includes(query) ||
          q.optionB.toLowerCase().includes(query) ||
          q.optionC.toLowerCase().includes(query) ||
          q.optionD.toLowerCase().includes(query) ||
          (q.explanation && q.explanation.toLowerCase().includes(query))
        );
      }

      setQuestions(list);

      const activeCategories = await api.getCategories(token);
      setCategories(activeCategories);
    } catch (err: any) {
      setError(err.message || 'Querying questions failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, isCustomFilter, searchQuery]);

  const handleOpenCreateForm = () => {
    setEditingQuestion(null);
    setFormError(null);
    // Auto preset category if custom filter was set, or default
    setCategoryInput('');
    setSelectedPresetCategory(selectedCategory || '');
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setExplanation('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (q: Question) => {
    setEditingQuestion(q);
    setFormError(null);
    setCategoryInput('');
    setSelectedPresetCategory(q.category);
    setQuestionText(q.questionText);
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectAnswer(q.correctAnswer);
    setExplanation(q.explanation || '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalCategory = (categoryInput.trim() || selectedPresetCategory).trim();
    if (!finalCategory) {
      setFormError('Please select or specify a category topic segment.');
      return;
    }

    if (!questionText.trim()) {
      setFormError('Question text is required.');
      return;
    }

    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setFormError('All Options A, B, C, and D are mandatory fields.');
      return;
    }

    const payload = {
      id: editingQuestion?.id || undefined,
      category: finalCategory,
      questionText: questionText.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctAnswer,
      explanation: explanation.trim()
    };

    try {
      await api.saveQuestion(payload, token);
      setIsFormOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setFormError(err.message || 'Could not complete save action.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await api.deleteQuestion(id, token);
      setDeletingId(null);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to remove target question.');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.toggleFavorite(id, token);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearQuestions = async () => {
    try {
      await api.clearQuestions(selectedCategory || undefined, token);
      setIsClearConfirmOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to clear questions.');
    }
  };

  // Excel (.xlsx / .xls) Upload Parser
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccessMsg(null);
    setImportingFile(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert worksheet to raw headers/rows
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 2) {
          throw new Error("The selected Excel worksheet does not contain any questions data rows.");
        }

        // Standardize headers to lowercase to tolerate variations
        const headers = data[0].map((h: any) => String(h || '').trim().toLowerCase().replace(/\s+|_/g, ''));
        
        // Match expected column schema: category, questiontext, optiona, optionb, optionc, optiond, correctanswer, explanation
        const colIndices = {
          category: headers.indexOf('category'),
          questionText: headers.findIndex(h => h.includes('question') || h === 'qtext' || h === 'text'),
          optionA: headers.findIndex(h => h === 'optiona' || h === 'a' || h.endsWith('opta')),
          optionB: headers.findIndex(h => h === 'optionb' || h === 'b' || h.endsWith('optb')),
          optionC: headers.findIndex(h => h === 'optionc' || h === 'c' || h.endsWith('optc')),
          optionD: headers.findIndex(h => h === 'optiond' || h === 'd' || h.endsWith('optd')),
          correctAnswer: headers.findIndex(h => h.includes('correct') || h === 'answer' || h === 'ans' || h === 'rightoption'),
          explanation: headers.findIndex(h => h.includes('explain') || h.includes('rational') || h === 'desc' || h === 'reason')
        };

        const parsedQuestions: any[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const getCellVal = (idx: number) => {
            return idx !== -1 && row[idx] !== undefined ? String(row[idx]).trim() : '';
          };

          const category = getCellVal(colIndices.category);
          const questionText = getCellVal(colIndices.questionText);
          const optionA = getCellVal(colIndices.optionA);
          const optionB = getCellVal(colIndices.optionB);
          const optionC = getCellVal(colIndices.optionC) || '-';
          const optionD = getCellVal(colIndices.optionD) || '-';
          let correctAnswer = getCellVal(colIndices.correctAnswer).toUpperCase();
          const explanation = getCellVal(colIndices.explanation);

          // Fallback parsing of correct answer letter
          if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            correctAnswer = 'A';
          }

          if (category && questionText && optionA && optionB) {
            parsedQuestions.push({
              category,
              questionText,
              optionA,
              optionB,
              optionC,
              optionD,
              correctAnswer,
              explanation
            });
          }
        }

        if (parsedQuestions.length === 0) {
          throw new Error("Could not find any readable rows. Make sure headers are spelled: 'category', 'questiontext', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer', 'explanation'");
        }

        // Import the parsed list directly into our database via API
        const importResult = await api.bulkImport(parsedQuestions, token);

        setImportSuccessMsg(`Success! Imported ${importResult.count} question models from Excel.`);
        fetchQuestions();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setImportError(err.message || 'Excel spreadsheet conversion failed.');
      } finally {
        setImportingFile(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const allCategoryOptions = Array.from(new Set([...categories, "General Knowledge", "English", "Mathematics", "Computer Science", "Islamiat", "Science", "Current Affairs", "Entry Tests"]));

  const getCategoryIconAndColor = (name: string) => {
    const norm = name.toLowerCase().trim();
    if (norm.includes('computer') || norm.includes('prog') || norm.includes('code') || norm.includes('tech')) {
      return {
        icon: <BookOpen className="h-5 w-5 text-blue-600" />,
        colorClass: "border-l-4 border-l-blue-500 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50/45",
        badgeClass: "bg-blue-100 text-blue-800",
        description: "Algorithms, programming logic, data structures, and tech syntax frameworks."
      };
    }
    if (norm.includes('knowledge') || norm.includes('general')) {
      return {
        icon: <Award className="h-5 w-5 text-emerald-600" />,
        colorClass: "border-l-4 border-l-emerald-500 hover:border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/45",
        badgeClass: "bg-emerald-100 text-emerald-800",
        description: "World history, facts, coordinates, geography, and general intelligence questions."
      };
    }
    if (norm.includes('math') || norm.includes('calc') || norm.includes('algebra')) {
      return {
        icon: <LayoutGrid className="h-5 w-5 text-amber-600" />,
        colorClass: "border-l-4 border-l-amber-500 hover:border-amber-400 bg-amber-50/20 hover:bg-amber-50/45",
        badgeClass: "bg-amber-100 text-amber-800",
        description: "Arithmetic logic, equations, probability computations, and spatial geometry formulas."
      };
    }
    if (norm.includes('english') || norm.includes('lingua') || norm.includes('word')) {
      return {
        icon: <Folder className="h-5 w-5 text-violet-600" />,
        colorClass: "border-l-4 border-l-violet-500 hover:border-violet-400 bg-violet-50/20 hover:bg-violet-50/45",
        badgeClass: "bg-violet-100 text-violet-800",
        description: "Lexicon context, accurate antonym options, grammar parsing, and logical similes."
      };
    }
    if (norm.includes('islam') || norm.includes('religion')) {
      return {
        icon: <Award className="h-5 w-5 text-teal-650" />,
        colorClass: "border-l-4 border-l-teal-500 hover:border-teal-400 bg-teal-50/20 hover:bg-teal-50/45",
        badgeClass: "bg-teal-100 text-teal-800",
        description: "Surah details, Quranic history, fast-facts, and Islamic history milestones."
      };
    }
    if (norm.includes('science') || norm.includes('bio') || norm.includes('chem') || norm.includes('phys')) {
      return {
        icon: <BookOpen className="h-5 w-5 text-pink-600" />,
        colorClass: "border-l-4 border-l-pink-500 hover:border-pink-400 bg-pink-50/20 hover:bg-pink-50/45",
        badgeClass: "bg-pink-100 text-pink-800",
        description: "Biological cell structures, chemical periodic elements, physics laws, and solar dynamics."
      };
    }
    if (norm.includes('current') || norm.includes('affair') || norm.includes('news')) {
      return {
        icon: <LayoutGrid className="h-5 w-5 text-sky-600" />,
        colorClass: "border-l-4 border-l-sky-500 hover:border-sky-400 bg-sky-50/20 hover:bg-sky-50/45",
        badgeClass: "bg-sky-100 text-sky-800",
        description: "Geopolitical statistics, local developments, global news, and block technology."
      };
    }
    if (norm.includes('entry') || norm.includes('test') || norm.includes('prep')) {
      return {
        icon: <Award className="h-5 w-5 text-rose-600" />,
        colorClass: "border-l-4 border-l-rose-500 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/45",
        badgeClass: "bg-rose-100 text-rose-800",
        description: "Logical pattern series, IQ questions, structural intelligence tests, and prep assessments."
      };
    }
    // Custom or fallback ones
    return {
      icon: <Folder className="h-5 w-5 text-indigo-500" />,
      colorClass: "border-l-4 border-l-slate-400 hover:border-slate-505 bg-slate-50/20 hover:bg-slate-50/45",
      badgeClass: "bg-slate-100 text-slate-800",
      description: "Custom aggregated collection segment uploaded or managed via local admin system."
    };
  };

  const getCategoryNewCardStyle = (name: string) => {
    const norm = name.toLowerCase().trim();
    
    if (norm.includes('computer') || norm.includes('prog') || norm.includes('code') || norm.includes('tech')) {
      return {
        icon: <BookOpen className="h-4 w-4 text-blue-600" />,
        badgeBgClass: "bg-blue-50 text-blue-600",
        trendText: "147% VS PREV. 28 DAYS",
        trendColorClass: "text-emerald-600",
        isPositive: true,
        desc: "Algorithms, programming logic, data structures, and computer tech frameworks."
      };
    }
    if (norm.includes('knowledge') || norm.includes('general')) {
      return {
        icon: <Award className="h-4 w-4 text-emerald-600" />,
        badgeBgClass: "bg-emerald-50 text-emerald-600",
        trendText: "53% VS PREV. 28 DAYS",
        trendColorClass: "text-emerald-600",
        isPositive: true,
        desc: "World history, facts, coordinates, geography, and general intelligence."
      };
    }
    if (norm.includes('math') || norm.includes('calc') || norm.includes('algebra')) {
      return {
        icon: <LayoutGrid className="h-4 w-4 text-amber-600" />,
        badgeBgClass: "bg-amber-50 text-amber-600",
        trendText: "10.7% VS PREV. 28 DAYS",
        trendColorClass: "text-rose-600",
        isPositive: false,
        desc: "Arithmetic logic, equations, probabilities, and spatial geometry formulas."
      };
    }
    if (norm.includes('english') || norm.includes('lingua') || norm.includes('word')) {
      return {
        icon: <Folder className="h-4 w-4 text-violet-600" />,
        badgeBgClass: "bg-violet-50 text-violet-600",
        trendText: "29% VS PREV. 28 DAYS",
        trendColorClass: "text-emerald-600",
        isPositive: true,
        desc: "Lexicon context, accurate antonym options, grammar parsing, and similes."
      };
    }
    if (norm.includes('islam') || norm.includes('religion')) {
      return {
        icon: <Award className="h-4 w-4 text-teal-650" />,
        badgeBgClass: "bg-teal-50 text-teal-600",
        trendText: "68% VS PREV. 28 DAYS",
        trendColorClass: "text-emerald-600",
        isPositive: true,
        desc: "Surah details, Quranic history, fast-facts, and Islamic history milestones."
      };
    }
    if (norm.includes('science') || norm.includes('bio') || norm.includes('chem') || norm.includes('phys')) {
      return {
        icon: <BookOpen className="h-4 w-4 text-pink-650" />,
        badgeBgClass: "bg-pink-50 text-pink-650",
        trendText: "42% VS PREV. 28 DAYS",
        trendColorClass: "text-emerald-600",
        isPositive: true,
        desc: "Biological cell structures, chemical elements, and solar dynamics."
      };
    }
    if (norm.includes('current') || norm.includes('affair') || norm.includes('news')) {
      return {
        icon: <LayoutGrid className="h-4 w-4 text-sky-600" />,
        badgeBgClass: "bg-sky-50 text-sky-600",
        trendText: "18% VS PREV. 28 DAYS",
        trendColorClass: "text-emerald-600",
        isPositive: true,
        desc: "Geopolitical statistics, local developments, global news, and updates."
      };
    }
    if (norm.includes('entry') || norm.includes('test') || norm.includes('prep')) {
      return {
        icon: <Award className="h-4 w-4 text-rose-600" />,
        badgeBgClass: "bg-rose-50 text-rose-600",
        trendText: "5.2% VS PREV. 28 DAYS",
        trendColorClass: "text-rose-600",
        isPositive: false,
        desc: "Logical pattern series, IQ questions, and test preparation assessments."
      };
    }
    return {
      icon: <Folder className="h-4 w-4 text-indigo-500" />,
      badgeBgClass: "bg-indigo-50 text-indigo-600",
      trendText: "12% VS PREV. 28 DAYS",
      trendColorClass: "text-emerald-600",
      isPositive: true,
      desc: "Custom aggregated collection segment uploaded or managed via local panel."
    };
  };

  const chartData = chartTimeframe === 'day' 
    ? [
        { name: '12 AM', value: 1400 },
        { name: '2 AM', value: 1650 },
        { name: '4 AM', value: 1550 },
        { name: '6 AM', value: 2200 },
        { name: '8 AM', value: 1850 },
        { name: '10 AM', value: 2050 },
        { name: '12 PM', value: 1900 },
        { name: '2 PM', value: 2150 },
        { name: '4 PM', value: 1950 },
        { name: '6 PM', value: 1400 },
        { name: '8 PM', value: 1800 },
        { name: '10 PM', value: 1650 }
      ]
    : chartTimeframe === 'week'
    ? [
        { name: 'Mon', value: 12500 },
        { name: 'Tue', value: 14800 },
        { name: 'Wed', value: 13900 },
        { name: 'Thu', value: 16200 },
        { name: 'Fri', value: 15300 },
        { name: 'Sat', value: 11200 },
        { name: 'Sun', value: 13400 }
      ]
    : [
        { name: 'Jan', value: 43000 },
        { name: 'Feb', value: 46000 },
        { name: 'Mar', value: 42000 },
        { name: 'Apr', value: 49000 },
        { name: 'May', value: 55050 },
        { name: 'Jun', value: 51000 },
        { name: 'Jul', value: 53050 },
        { name: 'Aug', value: 58000 },
        { name: 'Sep', value: 54000 },
        { name: 'Oct', value: 65000 },
        { name: 'Nov', value: 62000 },
        { name: 'Dec', value: 68500 }
      ];

  const chartTotal = chartTimeframe === 'day' ? '12.7K' : chartTimeframe === 'week' ? '110.8K' : '714.7K';
  const chartTrend = chartTimeframe === 'day' ? '+ 2.6%' : chartTimeframe === 'week' ? '+ 14.5%' : '+ 35.2%';
  const chartAverage = chartTimeframe === 'day' ? 1750 : chartTimeframe === 'week' ? 14000 : 53000;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1.5 animate-fade-in">
            <BookOpen className="h-5 w-5 text-indigo-600 animate-pulse" />
            Question Bank Workspace
          </h1>
          <p className="text-xs text-slate-500">
            {isViewingQuestions 
              ? `Viewing active catalog for "${selectedCategory || 'All Categories'}" topic.`
              : 'Control the global catalog dynamically. Choose a category card below or run batch updates.'}
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0 select-none">
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 bg-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-550" />
            Clear {selectedCategory ? 'Category' : 'Bank'}
          </button>
          
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-705 bg-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Import Excel Sheet
          </button>
          
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Question
          </button>
        </div>
      </div>

      {!isViewingQuestions ? (
        /* CATEGORY CARDS DASHBOARD VIEW (Shown by default on Question Bank click) */
        <div className="space-y-6">
          <div className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-lg text-xs leading-relaxed text-indigo-905 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Select a Course Module to Manage</span>
              <span className="text-slate-500">Click any card to load questions, filter items, edit content, or run operations.</span>
            </div>
            <span className="bg-indigo-600 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold shrink-0 self-start sm:self-auto">
               {totalQuestionsGlobal} Active Questions
            </span>
          </div>

          {/* Clean 2x4 card grid in style of the image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allCategoryOptions.map((cat, idx) => {
              const qCount = categoryCountMap[cat] || 0;
              const cardStyle = getCategoryNewCardStyle(cat);
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsViewingQuestions(true);
                  }}
                  className="bg-white p-4.5 rounded-xl border border-slate-200/95 shadow-2xs flex flex-col justify-between h-34 select-none hover:shadow-xs hover:border-slate-350 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider block leading-none">
                      {cat}
                    </span>
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold shrink-0 ${cardStyle.badgeBgClass}`}>
                      {cardStyle.icon}
                    </div>
                  </div>

                  <div className="my-1 text-left">
                    <span className="block text-2.5xl font-black text-slate-900 tracking-tight leading-none">
                      {qCount}
                      <span className="text-[10px] text-slate-400 font-sans font-semibold tracking-normal lowercase ml-1">questions</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-wider leading-none">
                    {cardStyle.isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className={cardStyle.trendColorClass}>
                      {cardStyle.trendText}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* "All Categories" Unified Card in the image's style */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => {
                setSelectedCategory(""); // Reset filters
                setIsViewingQuestions(true);
              }}
              className="bg-white p-4.5 rounded-xl border border-indigo-200 shadow-2xs flex flex-col justify-between h-34 select-none hover:shadow-xs hover:border-indigo-355 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10.5px] font-black text-indigo-700 uppercase tracking-wider block leading-none">
                  All Categories
                </span>
                <div className="w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold bg-indigo-50 text-indigo-600 shrink-0">
                  <LayoutGrid className="h-3.5 w-3.5 text-indigo-600" />
                </div>
              </div>

              <div className="my-1 text-left">
                <span className="block text-2.5xl font-black text-indigo-900 tracking-tight leading-none">
                  {totalQuestionsGlobal}
                  <span className="text-[10px] text-indigo-400 font-sans font-semibold tracking-normal lowercase ml-1">total items</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-wider leading-none">
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-600">
                  ↗ 2.6% VS PREV. DAY
                </span>
              </div>
            </motion.div>
          </div>

          {/* LOWER INTERACTIVE LINE GRAPH Mockup "VIEWS / READS TRAFFIC" (Directly replicating the image's bottom area) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/95 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">Workspace Traffic</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Active candidate database read hits, search inquiries, & quiz session loads</p>
              </div>

              {/* Day, Week, Month tabs replicating the mockup */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0 select-none bg-slate-50">
                <button
                  onClick={() => setChartTimeframe('day')}
                  className={`px-3 py-1 text-[10px] font-black transition-all cursor-pointer ${chartTimeframe === 'day' ? 'bg-white text-slate-800 shadow-2xs font-extrabold border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 border-r border-slate-200'}`}
                >
                  Day
                </button>
                <button
                  onClick={() => setChartTimeframe('week')}
                  className={`px-3 py-1 text-[10px] font-black transition-all cursor-pointer ${chartTimeframe === 'week' ? 'bg-white text-slate-800 shadow-2xs font-extrabold border-r border-slate-200' : 'text-slate-500 hover:text-slate-800 border-r border-slate-200'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setChartTimeframe('month')}
                  className={`px-3 py-1 text-[10px] font-black transition-all cursor-pointer ${chartTimeframe === 'month' ? 'bg-white text-slate-800 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Big Stat + trend information on the left */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-slate-800 tracking-tight font-serif leading-none">
                {chartTotal}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 leading-none">
                <ArrowUpRight className="h-3.5 w-3.5 font-black" />
                <span>{chartTrend}</span>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[8.5px] ml-0.5">VS PREV. PERIOD</span>
              </div>
            </div>

            {/* Real curve chart matching modern mockup precisely */}
            <div className="h-52 text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2.5 text-[10px] rounded-lg shadow-lg border border-slate-800">
                            <p className="font-extrabold border-b border-slate-700 pb-0.5 mb-1 text-slate-300">
                              {payload[0].payload.name}
                            </p>
                            <p className="flex items-center gap-1.5 text-blue-400 font-bold">
                              Queries: <span className="font-mono font-black text-white">{payload[0].value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientBlue)" />
                  <ReferenceLine y={chartAverage} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: 'AVG', fill: '#d97706', position: 'right', fontSize: 9, fontWeight: 'bold' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* QUESTIONS LISTING WORKSPACE VIEW (Shown when specific card is clicked) */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 animate-slide-in">
            <button
              onClick={() => {
                setIsViewingQuestions(false);
                setSelectedCategory("");
              }}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-805 font-bold transition-colors cursor-pointer select-none text-[10.5px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course Modules
            </button>
            <div className="text-[10.5px] text-slate-500 font-semibold px-2">
              Viewing Filtered: <span className="font-bold text-slate-800 bg-indigo-100/50 px-1.5 py-0.5 border border-indigo-100 rounded">{selectedCategory || "All Categories"}</span>
            </div>
          </div>

          {/* SEARCH AND FILTERS PANEL */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions keyword, options, rationale..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors text-slate-700 placeholder-slate-400"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                {allCategoryOptions.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={isCustomFilter}
                onChange={(e) => setIsCustomFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">Sources: All Items</option>
                <option value="seeded">Seeded Defaults Only</option>
                <option value="custom">Custom Creator Flow</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs flex gap-2 items-center">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ms-auto text-rose-500 hover:text-rose-750 text-[10px] font-bold">Dismiss</button>
            </div>
          )}

          {/* QUESTIONS LIST */}
          <div className="space-y-2">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400 font-medium">
                Syncing database questions catalog...
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-lg border border-slate-200">
                <HelpCircle className="h-6.5 w-6.5 text-slate-350 mx-auto mb-1.5" />
                <p className="text-slate-500 font-bold text-xs">No matched questions found</p>
                <p className="text-slate-400 text-[10.5px] mt-0.5">Try resetting search filters or inserting custom items.</p>
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs hover:border-slate-355 transition-all flex flex-col md:flex-row gap-4 justify-between items-start"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex gap-1.5 items-center flex-wrap">
                      <span className="badge category-tag bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {q.category}
                      </span>
                      
                      {q.isCustom ? (
                        <span className="px-1.5 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-850 text-[9px] font-extrabold rounded leading-none">
                          Custom Portal Item
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 border border-slate-200 bg-slate-100 text-slate-500 text-[9px] font-bold rounded leading-none">
                          Seeded Default
                        </span>
                      )}
                      
                      <button 
                        onClick={() => handleToggleFavorite(q.id)}
                        className={`p-1 hover:bg-slate-50 rounded transition-colors ms-auto md:ms-0 cursor-pointer ${q.isFavorite ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>

                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1.5">
                      {[
                        { key: 'A', text: q.optionA },
                        { key: 'B', text: q.optionB },
                        { key: 'C', text: q.optionC },
                        { key: 'D', text: q.optionD },
                      ].map((opt, i) => {
                        const isCorrect = q.correctAnswer === opt.key;
                        return (
                          <div
                            key={i}
                            className={`flex gap-2.5 items-center px-2 py-1.5 rounded border text-xs leading-none ${isCorrect ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-bold' : 'bg-slate-50/55 border-slate-100/60 text-slate-500'}`}
                          >
                            <span className={`h-4.5 w-4.5 rounded flex items-center justify-center font-bold text-[9.5px] shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200/80 text-slate-605'}`}>
                              {opt.key}
                            </span>
                            <span className="truncate flex-1 min-w-0">{opt.text}</span>
                            {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600 ms-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-2 p-2 bg-indigo-50/30 border border-indigo-100 rounded text-[11px] text-indigo-700 flex gap-1.5 items-start">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
                        <p className="leading-normal italic font-semibold">
                          Rationale: <span className="text-slate-650 font-normal">"{q.explanation}"</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 md:flex-col self-end md:self-start shrink-0 border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                    {deletingId === q.id ? (
                      <div className="bg-rose-50 border border-rose-200 p-1.5 rounded flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-rose-700">Delete question?</span>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold text-[9px] hover:bg-rose-700 cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded font-semibold text-[9px] hover:bg-slate-300 cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEditForm(q)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          title="Edit question profile"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Remove question model"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CRUD FORM MODEL DIALOG */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            >
              <div className="px-4 py-3 border-b border-slate-150 flex justify-between items-center bg-slate-50 rounded-t-lg font-sans">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
                  {editingQuestion ? 'Edit Question Details' : 'Create Question Template'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-4 space-y-3 font-sans text-xs">
                
                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 rounded text-xs flex gap-2 items-start animate-shake">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span className="font-semibold">{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1"> Preset category </label>
                    <select
                      value={selectedPresetCategory}
                      onChange={(e) => {
                        setSelectedPresetCategory(e.target.value);
                        setCategoryInput(''); // clear custom if preset selected
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">Select Category...</option>
                      {allCategoryOptions.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1"> Or create category </label>
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => {
                        setCategoryInput(e.target.value);
                        setSelectedPresetCategory(''); // clear preset
                      }}
                      placeholder="e.g. Science"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-705 focus:outline-none focus:border-indigo-505"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Question text</label>
                  <textarea
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={2.5}
                    placeholder="Enter full objective question block text here..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-705 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Option grid inputs */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase">Multiple-choice options</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      { key: 'A', stateIndex: optionA, setChange: setOptionA },
                      { key: 'B', stateIndex: optionB, setChange: setOptionB },
                      { key: 'C', stateIndex: optionC, setChange: setOptionC },
                      { key: 'D', stateIndex: optionD, setChange: setOptionD },
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center bg-slate-50 rounded border border-slate-200 pr-1.5">
                        <span className="px-2.5 bg-slate-200 text-slate-650 font-bold text-[10px] h-7 flex items-center justify-center rounded-l select-none shrink-0 border-r border-slate-200">
                          {opt.key}
                        </span>
                        <input
                          type="text"
                          required
                          value={opt.stateIndex}
                          onChange={(e) => opt.setChange(e.target.value)}
                          placeholder={`Option ${opt.key}`}
                          className="w-full px-2 bg-transparent border-none text-xs text-slate-700 focus:outline-none h-7"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Correct option</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['A', 'B', 'C', 'D'] as const).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setCorrectAnswer(ch)}
                          className={`py-1 rounded text-xs font-bold cursor-pointer ${correctAnswer === ch ? 'bg-indigo-650 text-white shadow-xs' : 'bg-slate-100 text-slate-505 hover:bg-slate-200'}`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Explanation / rationale</label>
                    <input
                      type="text"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Add simple solution review note..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-indigo-505 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-1.5 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-655 rounded text-xs font-bold hover:bg-slate-50 cursor-pointer bg-white"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-650 text-white rounded text-xs font-bold shadow-xs hover:bg-indigo-755 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXCEL IMPORT SPREADSHEET DIALOG */}
      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200"
            >
              <div className="px-4 py-3 border-b border-slate-150 flex justify-between items-center bg-slate-50 rounded-t-lg font-sans">
                <h3 className="text-xs font-bold text-slate-750 flex items-center gap-1.5 text-slate-800">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Import Excel Spreadsheet
                </h3>
                <button onClick={() => {
                  setIsImportOpen(false);
                  setImportError(null);
                  setImportSuccessMsg(null);
                }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 font-sans text-xs flex flex-col">
                
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded text-[11px] text-emerald-850 leading-relaxed">
                  <span className="font-bold block text-[11.5px] text-emerald-950 mb-1">Expected Excel Columns (Headers):</span>
                  <div className="bg-white px-2 py-1.5 rounded border border-emerald-100 font-mono text-[9px] text-slate-600 select-all mb-1 overflow-x-auto truncate">
                    category, questiontext, optiona, optionb, optionc, optiond, correctanswer, explanation
                  </div>
                  <span className="text-slate-500 text-[10px] block mt-1">
                    * Make sure your first row serves as the header line. Spelling variations (like <strong>Question Text</strong>, <strong>Correct Answer</strong>, or options such as letters <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, <strong>D</strong>) are fully tolerated.
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-205 rounded-lg p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls"
                    onChange={handleExcelImport}
                    className="hidden"
                    id="excel-file-uploader"
                    disabled={importingFile}
                  />
                  
                  <FileSpreadsheet className="h-8 w-8 text-slate-400 mb-2" />
                  
                  {importingFile ? (
                    <div className="text-center">
                      <div className="h-5 w-5 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                      <span className="text-xs font-semibold text-slate-500">Processing worksheet rows...</span>
                    </div>
                  ) : (
                    <label
                      htmlFor="excel-file-uploader"
                      className="cursor-pointer text-center text-xs text-indigo-600 hover:text-indigo-805 font-bold"
                    >
                      Click here to select Excel Spreadsheet
                      <span className="block text-[10px] text-slate-400 font-normal mt-1">Supports (.xlsx, .xls)</span>
                    </label>
                  )}
                </div>

                {importError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded text-xs flex gap-2 items-start">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-750 rounded text-xs flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{importSuccessMsg}</span>
                  </div>
                )}

                <div className="flex gap-1.5 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportOpen(false);
                      setImportError(null);
                      setImportSuccessMsg(null);
                    }}
                    className="px-3 py-1.5 border border-slate-200 text-slate-650 rounded text-xs font-bold hover:bg-slate-50 cursor-pointer bg-white"
                  >
                    Close Dialog
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLEAR QUESTIONS CONFIRMATION DIALOG */}
      <AnimatePresence>
        {isClearConfirmOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200"
            >
              <div className="px-4 py-3 border-b border-slate-150 flex justify-between items-center bg-slate-50 rounded-t-lg font-sans">
                <h3 className="text-xs font-bold text-slate-705 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600 animate-pulse" />
                  Clear Objective Questions
                </h3>
                <button onClick={() => setIsClearConfirmOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 font-sans text-xs">
                <p className="text-[11px] text-slate-500 leading-normal">
                  Are you sure you want to delete {selectedCategory ? `all questions under the category "${selectedCategory}"` : 'all questions in the entire database'}?
                </p>
                <div className="bg-rose-50 p-2.5 rounded border border-rose-100 text-[10px] text-rose-700 font-semibold flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-550" />
                  <span>Warning: This operation is permanent and cannot be undone. All matching question records will be deleted.</span>
                </div>

                <div className="flex gap-1.5 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsClearConfirmOpen(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-650 rounded bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearQuestions}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 shadow-sm cursor-pointer"
                  >
                    Yes, Delete All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ClipboardList, Shield, RefreshCw, Star, Trash2, Award, Calendar, Activity, Zap, ChevronDown, ChevronUp, Edit3, X, AlertCircle } from 'lucide-react';
import { UserProfile, QuizResult } from '../types.js';
import { api } from '../utils/api.js';

interface UserManagerProps {
  token: string | null;
}

export function UserManager({ token }: UserManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded User history lists
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<QuizResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Adjust Stats Form State
  const [adjustUser, setAdjustUser] = useState<UserProfile | null>(null);
  const [newPoints, setNewPoints] = useState('');
  const [newStreak, setNewStreak] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers(token);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred pulling student users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleExpandUser = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserHistory([]);
      return;
    }

    setExpandedUser(userId);
    setUserHistory([]);
    setHistoryLoading(true);

    try {
      const history = await api.getUserResults(userId, token);
      setUserHistory(history);
    } catch (err) {
      console.error('History fetch error', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenAdjustStats = (user: UserProfile) => {
    setAdjustUser(user);
    setFormError(null);
    setNewPoints(String(user.totalPoints));
    setNewStreak(String(user.streak));
    setNewLevel(String(user.level));
  };

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUser) return;

    try {
      await api.adjustUserStats(
        adjustUser.id, 
        Number(newPoints), 
        Number(newStreak), 
        Number(newLevel) || undefined,
        token
      );

      setAdjustUser(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Stats update failed');
    }
  };

  const getLevelBadgeColor = (lvl: number) => {
    const badgeColors: Record<number, string> = {
      1: 'bg-slate-100 text-slate-700 border-slate-200',
      2: 'bg-emerald-50 text-emerald-850 border-emerald-200',
      3: 'bg-blue-50 text-blue-800 border-blue-200',
      4: 'bg-amber-50 text-amber-800 border-amber-200',
      5: 'bg-indigo-50 text-indigo-805 border-indigo-200',
    };
    return badgeColors[lvl] || badgeColors[1];
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-805">
            Student User Management
          </h1>
          <p className="text-xs text-slate-450">
            Monitor scholar performance, check historical quiz submissions, or correct metrics as support tool.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 bg-white rounded hover:bg-slate-50 text-xs font-bold shadow-sm cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Scholars
        </button>
      </div>

      <div>
        {loading ? (
          <p className="py-20 text-center text-xs text-slate-400 font-medium">Enumerating system registrants...</p>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded text-xs">{error}</div>
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">Zero registered users indexed in the database.</p>
        ) : (
          <div className="space-y-2">
            {users.map((item) => {
              const isExpanded = expandedUser === item.id;
              
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-205 shadow-xs rounded-lg overflow-hidden hover:border-slate-350 transition-colors"
                >
                  {/* Primary Row Summary */}
                  <div className="p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
                    <div className="flex gap-3.5 items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 text-xs text-center border border-slate-200">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-800 text-xs leading-none">{item.name}</h3>
                          {item.isAdmin && (
                            <span className="px-1.5 py-0.5 border border-indigo-200 bg-indigo-50 text-indigo-650 text-[8px] font-extrabold uppercase rounded tracking-wider flex items-center gap-0.5 h-4">
                              <Shield className="h-2 w-2 text-indigo-500" />
                              System Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-400 block mt-0.5 leading-none">{item.email}</p>
                      </div>
                    </div>

                    {/* Performance Tags list */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        <span className={`px-2 py-0.5 border rounded text-[11px] font-bold leading-none ${getLevelBadgeColor(item.level)}`}>
                          Level {item.level}
                        </span>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-bold leading-none">Streak</span>
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5 justify-end mt-1 font-mono leading-none">
                          <Zap className="h-3 w-3 text-rose-500 fill-rose-100" />
                          {item.streak} days
                        </span>
                      </div>

                      <div className="flex flex-col text-right min-w-[70px]">
                        <span className="text-[9px] text-slate-400 uppercase font-bold leading-none">Total Points</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 font-mono leading-none">{item.totalPoints} PTS</span>
                      </div>

                      <div className="flex flex-col text-right hidden sm:flex">
                        <span className="text-[9px] text-slate-400 uppercase font-bold leading-none">Last Quiz Taken</span>
                        <span className="text-xs text-slate-500 font-semibold mt-1 font-mono leading-none">
                          {item.lastQuizTime > 0 ? new Date(item.lastQuizTime).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>

                    {/* Support Tools triggers */}
                    <div className="flex gap-1.5 border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleOpenAdjustStats(item)}
                        className="flex items-center gap-1 px-2.5 py-1 border border-slate-205 text-slate-650 rounded hover:bg-slate-50 text-[10px] font-semibold leading-none cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3 text-slate-400" />
                        Adjust Stats
                      </button>

                      <button
                        onClick={() => toggleExpandUser(item.id)}
                        className="flex items-center gap-1 px-1.5 py-1 hover:bg-slate-50 rounded text-slate-500 cursor-pointer"
                        title="Display attempts history log"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded History Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-slate-150 bg-slate-50/50 flex flex-col overflow-hidden text-xs"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex font-semibold text-slate-650 gap-1.5 items-center">
                            <ClipboardList className="h-4 w-4 text-indigo-501" />
                            <span>Scholar Quiz Attempts History Log ({userHistory.length})</span>
                          </div>

                          {historyLoading ? (
                            <p className="text-slate-400 py-4 italic">Loading user's portfolio history...</p>
                          ) : userHistory.length === 0 ? (
                            <p className="text-slate-400 py-3 block italic">This scholar hasn't submitted quiz answers through the web portal yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {userHistory.map((resItem) => (
                                <div
                                  key={resItem.id}
                                  className="bg-white p-3 border border-slate-200 rounded-md space-y-1.5 relative"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                      <span className="badge category-tag">
                                        {resItem.category}
                                      </span>
                                      <p className="text-slate-400 text-[9.5px] flex items-center gap-1 pt-1 leading-none font-mono">
                                        <Calendar className="h-3 w-3 text-slate-400" />
                                        {new Date(resItem.quizDate).toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <span className="text-xs font-bold text-slate-800 leading-none block font-mono">
                                        Score: {resItem.score} / {resItem.totalQuestions}
                                      </span>
                                      <span className="text-[10px] font-bold text-emerald-600 font-mono block mt-0.5">
                                        +{(resItem.score * 10)} PTS
                                      </span>
                                    </div>
                                  </div>

                                  {resItem.note && (
                                    <div className="p-2 border border-dashed border-slate-200 rounded bg-slate-50 flex items-start text-[10px] text-slate-500 leading-normal">
                                      <strong>Scholar Note:</strong> <span className="ms-1 italic">"{resItem.note}"</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADJUST STATS DIALOG */}
      <AnimatePresence>
        {adjustUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200"
            >
              <div className="px-4 py-3 border-b border-slate-150 flex justify-between items-center bg-slate-50 rounded-t-lg font-sans">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-650 animate-pulse" />
                  Support Tool: Adjust Scholar Stats
                </h3>
                <button onClick={() => setAdjustUser(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleStatsSubmit} className="p-4 space-y-3 font-sans text-xs">
                <div className="bg-indigo-50 p-2.5 rounded border border-indigo-100 space-y-0.5">
                  <p className="font-bold text-indigo-805 leading-none">Correcting profile for:</p>
                  <p className="text-[10px] text-indigo-700 font-medium">{adjustUser.name} ({adjustUser.email})</p>
                </div>

                {formError && (
                  <div className="bg-rose-50 text-rose-700 p-2.5 rounded border border-rose-150 flex items-center gap-1.5 font-sans leading-none text-[10px]">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Total Points</label>
                  <input
                    type="number"
                    required
                    value={newPoints}
                    onChange={(e) => {
                      setNewPoints(e.target.value);
                      // Estimate level threshold automatically:
                      const pts = Number(e.target.value) || 0;
                      if (pts >= 1000) setNewLevel('5');
                      else if (pts >= 600) setNewLevel('4');
                      else if (pts >= 300) setNewLevel('3');
                      else if (pts >= 100) setNewLevel('2');
                      else setNewLevel('1');
                    }}
                    placeholder="e.g. 520"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 leading-none">
                    Updates points. Derived level will automatically scale.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Consecutive Days Streak</label>
                  <input
                    type="number"
                    required
                    value={newStreak}
                    onChange={(e) => setNewStreak(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-705 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Override Level (Force badge)</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-705 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="1">Level 1 (Beginner, &lt;100 PTS)</option>
                    <option value="2">Level 2 (Scholar Pioneer, &gt;=100 PTS)</option>
                    <option value="3">Level 3 (Academic Prodigy, &gt;=300 PTS)</option>
                    <option value="4">Level 4 (Elite Innovator, &gt;=600 PTS)</option>
                    <option value="5">Level 5 (Grand Master Guru, &gt;=1000 PTS)</option>
                  </select>
                </div>

                <div className="flex gap-1.5 justify-end pt-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAdjustUser(null)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white rounded text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-650 text-white rounded text-xs font-bold hover:bg-indigo-755 shadow-sm cursor-pointer"
                  >
                    Apply Corrections
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

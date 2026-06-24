import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Star, Zap, Trophy, TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import { api } from '../utils/api.js';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  level: number;
  totalPoints?: number;
  weeklyPoints?: number;
  streak: number;
  profileImageUri: string | null;
}

interface LeaderboardPageProps {
  token: string | null;
}

export function LeaderboardPage({ token }: LeaderboardPageProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'alltime'>('weekly');
  const [rankedList, setRankedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = activeTab === 'weekly' 
        ? await api.getLeaderboardWeekly(token) 
        : await api.getLeaderboardAllTime(token);
      setRankedList(list);
    } catch (err: any) {
      setError(err.message || 'Error compiling leaderboard calculations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [token, activeTab]);

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-805">
            Scholars Leaderboard
          </h1>
          <p className="text-xs text-slate-450">
            Check live ranking tallies across students. Competitors build points the fastest!
          </p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-205 text-slate-600 bg-white rounded hover:bg-slate-50 text-xs font-bold shadow-sm cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh Stats
        </button>
      </div>

      {/* RATING CATEGORY TABS SLOTS */}
      <div className="flex bg-slate-200/60 p-0.5 rounded max-w-xs">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 flex justify-center items-center gap-1.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${activeTab === 'weekly' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
          Weekly Scholars
        </button>
        <button
          onClick={() => setActiveTab('alltime')}
          className={`flex-1 flex justify-center items-center gap-1.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${activeTab === 'alltime' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          All-Time Masters
        </button>
      </div>

      {/* RANKINGS BOARD */}
      <div>
        {loading ? (
          <p className="text-center py-16 text-xs text-slate-400 font-medium">Computing final ranking tallies...</p>
        ) : error ? (
          <p className="p-4 bg-rose-50 border border-slate-150 rounded text-xs text-rose-600">{error}</p>
        ) : rankedList.length === 0 ? (
          <p className="text-center py-12 text-slate-400 italic">No rankings statistics recorded.</p>
        ) : (
          <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden max-w-xl">
            <div className="bg-slate-50/50 px-3.5 py-2.5 border-b border-slate-150 flex items-center gap-2 text-xs text-indigo-850 font-bold uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-505" />
              <span>Current rankings positions</span>
            </div>

            <div className="divide-y divide-slate-150">
              {rankedList.map((item, index) => {
                const rank = index + 1;
                let bgRank = 'text-slate-400 bg-slate-50';
                if (rank === 1) bgRank = 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
                if (rank === 2) bgRank = 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200';
                if (rank === 3) bgRank = 'bg-emerald-100 text-emerald-700';

                return (
                  <div
                    key={item.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Number Circle */}
                      <span className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-xs font-bold leading-none shrink-0 ${bgRank}`}>
                        {rank}
                      </span>

                      <div className="h-7 w-7 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0 select-none text-[11px]">
                        {item.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-xs leading-none">{item.name}</span>
                          <span className="px-1 py-0.2 px-1.5 border border-indigo-100 bg-indigo-50 text-indigo-700 text-[8px] font-extrabold rounded">
                            Lvl {item.level}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-none">{item.email}</p>
                      </div>
                    </div>

                    {/* Streak and points results */}
                    <div className="flex items-center gap-4 text-right font-sans">
                      <div className="flex items-center gap-0.5 text-xs font-bold text-rose-600 font-mono">
                        <Zap className="h-3 w-3 text-rose-500 fill-rose-100 shrink-0" />
                        <span>{item.streak}d</span>
                      </div>

                      <div className="min-w-[70px] flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {activeTab === 'weekly' ? item.weeklyPoints : item.totalPoints}
                        </span>
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                          PTS
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

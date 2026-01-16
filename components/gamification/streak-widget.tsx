'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy, Calendar, X, Bell } from 'lucide-react';

interface StreakWidgetProps {
    currentStreak: number;
    todayMinutes: number;
    dailyGoal?: number; // minutes
    weeklyData?: number[]; // last 7 days activity
}

export function StreakWidget({
    currentStreak,
    todayMinutes,
    dailyGoal = 15,
    weeklyData = [0, 0, 0, 0, 0, 0, 0]
}: StreakWidgetProps) {
    const [showModal, setShowModal] = useState(false);
    const [celebrated, setCelebrated] = useState(false);

    const goalReached = todayMinutes >= dailyGoal;
    const progress = Math.min((todayMinutes / dailyGoal) * 100, 100);

    // Celebrate when goal is reached
    useEffect(() => {
        if (goalReached && !celebrated) {
            setCelebrated(true);
        }
    }, [goalReached, celebrated]);

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();

    return (
        <>
            {/* Streak Button */}
            <motion.button
                onClick={() => setShowModal(true)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${currentStreak > 0
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    animate={currentStreak > 0 ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 5, 0]
                    } : {}}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut"
                    }}
                >
                    <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'text-yellow-300' : ''}`} />
                </motion.div>
                <span className="text-lg font-bold">{currentStreak}</span>

                {/* Goal progress ring */}
                {!goalReached && (
                    <svg className="absolute -right-1 -top-1 h-5 w-5">
                        <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.3"
                        />
                        <motion.circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={50.27}
                            strokeDashoffset={50.27 * (1 - progress / 100)}
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 50.27 }}
                            animate={{ strokeDashoffset: 50.27 * (1 - progress / 100) }}
                            transform="rotate(-90 10 10)"
                        />
                    </svg>
                )}

                {goalReached && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                        <Zap className="h-3 w-3 text-white" />
                    </motion.div>
                )}
            </motion.button>

            {/* Streak Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center relative">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>

                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, -10, 10, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                    className="inline-block mb-2"
                                >
                                    <Flame className="h-16 w-16 text-yellow-300 mx-auto" />
                                </motion.div>

                                <h2 className="text-5xl font-bold text-white mb-1">{currentStreak}</h2>
                                <p className="text-white/80">day streak!</p>
                            </div>

                            {/* Daily Goal */}
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">Today's Goal</span>
                                        <span className="text-white font-medium">{todayMinutes}/{dailyGoal} min</span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${goalReached
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                                                }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    {goalReached && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-green-400 text-sm mt-2 flex items-center gap-1"
                                        >
                                            <Trophy className="h-4 w-4" />
                                            Goal reached! Keep it up!
                                        </motion.p>
                                    )}
                                </div>

                                {/* Weekly Calendar */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-400 text-sm">This Week</span>
                                    </div>
                                    <div className="flex justify-between">
                                        {days.map((day, i) => {
                                            const isToday = i === today;
                                            const hasActivity = weeklyData[i] > 0;
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1">
                                                    <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-slate-500'}`}>
                                                        {day}
                                                    </span>
                                                    <motion.div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${hasActivity
                                                                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                                                : isToday
                                                                    ? 'bg-slate-700 border-2 border-orange-500'
                                                                    : 'bg-slate-800'
                                                            }`}
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        {hasActivity && (
                                                            <Flame className="h-4 w-4 text-yellow-300" />
                                                        )}
                                                    </motion.div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Motivation */}
                                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                    <p className="text-slate-300 text-sm">
                                        {currentStreak === 0
                                            ? "🎯 Start your streak today!"
                                            : currentStreak < 7
                                                ? `🔥 ${7 - currentStreak} more days to your first week!`
                                                : currentStreak < 30
                                                    ? "⚡ Amazing! Keep the momentum going!"
                                                    : "🏆 Legend! You're unstoppable!"
                                        }
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

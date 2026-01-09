'use client';

import React from 'react';
import { Flame, Target, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressOverviewProps {
    currentStreak: number;
    completedThisWeek: number;
    totalMastered: number;
    nextMilestone: string;
}

export function ProgressOverview({
    currentStreak,
    completedThisWeek,
    totalMastered,
    nextMilestone,
}: ProgressOverviewProps) {
    const stats = [
        {
            icon: Flame,
            label: 'Current Streak',
            value: `${currentStreak} days`,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            shadowColor: 'shadow-orange-500/30',
        },
        {
            icon: Calendar,
            label: 'This Week',
            value: `${completedThisWeek} lessons`,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            shadowColor: 'shadow-blue-500/30',
        },
        {
            icon: Target,
            label: 'Mastered',
            value: `${totalMastered} topics`,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            shadowColor: 'shadow-green-500/30',
        },
        {
            icon: TrendingUp,
            label: 'Next Milestone',
            value: nextMilestone,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            shadowColor: 'shadow-purple-500/30',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`card group hover:border-white/20 transition-all relative overflow-hidden ${stat.shadowColor} shadow-lg`}
                >
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    <div className="relative z-10 flex items-start gap-4">
                        <motion.div
                            className={`p-3 rounded-xl ${stat.bgColor} shadow-lg`}
                            whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                            <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }} />
                        </motion.div>
                        <div className="flex-1">
                            <p className="text-zinc-400 text-sm mb-1">{stat.label}</p>
                            <p className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.value}
                            </p>
                        </div>
                    </div>

                    {/* Animated gradient underline */}
                    <motion.div
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        className={`h-1 mt-4 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}
                    />
                </motion.div>
            ))}
        </div>
    );
}

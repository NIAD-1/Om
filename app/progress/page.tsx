'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Clock,
    Flame,
    BookOpen,
    Play,
    Trophy,
    Target,
    Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getActivityStats, getRecentActivities, ActivityEntry } from '@/lib/firestore';

export default function ProgressPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalMinutesToday: 0,
        totalMinutesThisWeek: 0,
        lessonsCompletedThisWeek: 0,
        currentStreak: 0
    });
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const [statsData, activitiesData] = await Promise.all([
                    getActivityStats(user.uid),
                    getRecentActivities(user.uid, 50)
                ]);
                setStats(statsData);
                setActivities(activitiesData);
            } catch (e) {
                console.error('Failed to load progress data', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const formatMinutes = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'video_watch': return Play;
            case 'lesson_complete': return BookOpen;
            case 'quiz_pass': return Target;
            case 'exam_pass': return Trophy;
            default: return BookOpen;
        }
    };

    const getActivityLabel = (type: string) => {
        switch (type) {
            case 'video_watch': return 'Watched';
            case 'lesson_complete': return 'Completed';
            case 'quiz_pass': return 'Passed Quiz';
            case 'exam_pass': return 'Passed Exam';
            default: return 'Activity';
        }
    };

    // Group activities by date
    const groupedActivities = activities.reduce((acc, activity) => {
        const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(activity);
        return acc;
    }, {} as Record<string, ActivityEntry[]>);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div id="progress-page-header">
                    <h1 className="text-3xl font-bold text-white mb-2">Progress Tracking</h1>
                    <p className="text-slate-400">Your learning journey at a glance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <Flame className="h-5 w-5 text-orange-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Streak</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-400">{stats.currentStreak}</p>
                        <p className="text-slate-500 text-xs">days</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Clock className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Today</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-400">{formatMinutes(stats.totalMinutesToday)}</p>
                        <p className="text-slate-500 text-xs">learning</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <BarChart3 className="h-5 w-5 text-purple-400" />
                            </div>
                            <span className="text-slate-400 text-sm">This Week</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-400">{formatMinutes(stats.totalMinutesThisWeek)}</p>
                        <p className="text-slate-500 text-xs">total</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <BookOpen className="h-5 w-5 text-green-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Lessons</span>
                        </div>
                        <p className="text-3xl font-bold text-green-400">{stats.lessonsCompletedThisWeek}</p>
                        <p className="text-slate-500 text-xs">this week</p>
                    </motion.div>
                </div>

                {/* Activity Log */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Activity Log</h2>
                    </div>

                    {Object.keys(groupedActivities).length === 0 ? (
                        <div className="text-center py-12">
                            <Play className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No activity yet</p>
                            <p className="text-slate-500 text-sm">Start watching videos to see your progress here</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                                <div key={date}>
                                    <h3 className="text-sm font-medium text-slate-500 mb-3">{date}</h3>
                                    <div className="space-y-2">
                                        {dayActivities.map((activity) => {
                                            const IconComponent = getActivityIcon(activity.type);
                                            return (
                                                <div
                                                    key={activity.id}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
                                                >
                                                    <div className={`p-2 rounded-lg ${activity.type === 'video_watch' ? 'bg-blue-500/20 text-blue-400' :
                                                        activity.type === 'lesson_complete' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-purple-500/20 text-purple-400'
                                                        }`}>
                                                        <IconComponent className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white">
                                                            <span className="text-slate-400">{getActivityLabel(activity.type)}</span>
                                                            {' '}<span className="text-blue-400">{activity.lessonName}</span>
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {activity.curriculumTitle}
                                                            {activity.roadmapTitle && ` • ${activity.roadmapTitle}`}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-white">{activity.minutesSpent} min</p>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                                                                hour: 'numeric',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

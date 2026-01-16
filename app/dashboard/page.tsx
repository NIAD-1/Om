'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, TrendingUp, Zap, Clock, BookOpen, Play, HelpCircle } from 'lucide-react';
import { DomainCard } from '@/components/dashboard/domain-card';
import { ProgressOverview } from '@/components/dashboard/progress-overview';
import { NewTrackInput } from '@/components/dashboard/new-track-input';
import { LoadingAI } from '@/components/ui/loading-ai';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DOMAINS, ICON_MAP } from '@/lib/domains-config';
import { generateCurriculum } from '@/lib/api-client';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { saveCurriculum, getActivityStats, getRecentActivities, ActivityEntry } from '@/lib/firestore';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { StreakWidget } from '@/components/gamification/streak-widget';

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState('technology');
    const [domainCards] = useState(DOMAINS);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check if first visit and show onboarding
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
            localStorage.setItem('hasSeenOnboarding', 'true');
        }
    }, []);

    const domainCategories = [
        { id: 'technology', name: 'Technology', emoji: '💻' },
        { id: 'finance', name: 'Finance', emoji: '💰' },
        { id: 'business', name: 'Business', emoji: '📊' },
        { id: 'sciences', name: 'Sciences', emoji: '🔬' },
        { id: 'mathematics', name: 'Mathematics', emoji: '🔢' },
        { id: 'engineering', name: 'Engineering', emoji: '⚙️' },
        { id: 'health', name: 'Health & Medicine', emoji: '🏥' },
        { id: 'humanities', name: 'Humanities', emoji: '📚' },
        { id: 'social-sciences', name: 'Social Sciences', emoji: '🌍' },
        { id: 'languages', name: 'Languages', emoji: '🗣️' },
        { id: 'arts', name: 'Arts & Design', emoji: '🎨' },
        { id: 'other', name: 'Other', emoji: '📖' },
    ];

    const [progressData, setProgressData] = useState({
        currentStreak: 0,
        completedThisWeek: 0,
        totalMastered: 0,
        nextMilestone: 'Complete first lesson',
        todayMinutes: 0,
    });
    const [recentActivities, setRecentActivities] = useState<ActivityEntry[]>([]);

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;
            try {
                const stats = await getActivityStats(user.uid);
                setProgressData({
                    currentStreak: stats.currentStreak,
                    completedThisWeek: stats.lessonsCompletedThisWeek,
                    totalMastered: stats.totalMinutesThisWeek,
                    nextMilestone: stats.lessonsCompletedThisWeek > 0 ? 'Keep learning!' : 'Complete first lesson',
                    todayMinutes: stats.totalMinutesToday,
                });

                const activities = await getRecentActivities(user.uid, 5);
                setRecentActivities(activities);
            } catch (e) {
                console.error('Failed to load activity stats', e);
            }
        };
        loadStats();
    }, [user]);

    const handleGenerateCurriculum = async (field: string) => {
        setIsGenerating(true);
        try {
            const curriculum = await generateCurriculum(field);

            // Generate a random ID for the curriculum if not present
            const curriculumId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            // Save to Firestore
            const savedCurriculum = {
                ...curriculum,
                id: curriculumId,
                createdAt: timestamp,
                field,
                domain: selectedDomain
            };

            if (user) {
                await saveCurriculum(user.uid, savedCurriculum);
            }

            console.log('Generated curriculum:', curriculum);
            router.push(`/learning-paths/${curriculumId}`);
        } catch (error) {
            console.error('Failed to generate curriculum:', error);
            alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectDomain = (domainId: string) => {
        router.push(`/learning-paths?domain=${domainId}`);
    };

    return (
        <DashboardLayout>
            {isGenerating && <LoadingAI />}
            <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

            <div className="space-y-8">
                {/* Welcome Section */}
                <motion.div
                    id="dashboard-welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 p-8"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Welcome back! 👋
                            </h1>
                            <p className="text-slate-300 text-lg">
                                Ready to continue your mastery journey?
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-green-400 border border-green-500/30">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-medium">All Systems Active</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <StreakWidget
                                currentStreak={progressData.currentStreak}
                                todayMinutes={progressData.todayMinutes}
                                dailyGoal={15}
                            />
                            <button
                                onClick={() => setShowOnboarding(true)}
                                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                title="Show Tutorial"
                            >
                                <HelpCircle className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Overview */}
                <motion.div
                    id="progress-overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Your Progress</h2>
                    </div>
                    <ProgressOverview {...progressData} />
                </motion.div>

                {/* New Track Generator */}
                <motion.div
                    id="new-track-input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">Generate New Learning Path</h2>
                    </div>
                    <NewTrackInput
                        onGenerate={handleGenerateCurriculum}
                        selectedDomain={selectedDomain}
                        onDomainChange={setSelectedDomain}
                    />
                </motion.div>

                {/* Recent Activity Feed */}
                {recentActivities.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="card"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="h-5 w-5 text-green-400" />
                            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                        </div>
                        <div className="space-y-3">
                            {recentActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                                >
                                    <div className={`p-2 rounded-lg ${activity.type === 'video_watch' ? 'bg-blue-500/20 text-blue-400' :
                                        activity.type === 'lesson_complete' ? 'bg-green-500/20 text-green-400' :
                                            'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {activity.type === 'video_watch' ? <Play className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {activity.minutesSpent} min on <span className="text-blue-400">{activity.lessonName}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {activity.curriculumTitle} • {new Date(activity.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Domains Grid */}
                <motion.div
                    id="domain-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Knowledge Domains
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {domainCards.map((domain: any, index: number) => {
                            const IconComponent = ICON_MAP[domain.icon as keyof typeof ICON_MAP];
                            return (
                                <motion.div
                                    key={domain.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                >
                                    <DomainCard
                                        {...domain}
                                        icon={IconComponent}
                                        progress={0}
                                        moduleCount={0}
                                        onSelect={handleSelectDomain}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

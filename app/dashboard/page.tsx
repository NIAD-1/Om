'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { DomainCard } from '@/components/dashboard/domain-card';
import { ProgressOverview } from '@/components/dashboard/progress-overview';
import { NewTrackInput } from '@/components/dashboard/new-track-input';
import { LoadingAI } from '@/components/ui/loading-ai';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DOMAINS, ICON_MAP } from '@/lib/domains-config';
import { generateCurriculum } from '@/lib/api-client';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { saveCurriculum } from '@/lib/firestore';

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState('technology');
    const [domainCards] = useState(DOMAINS);

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

    const progressData = {
        currentStreak: 0,
        completedThisWeek: 0,
        totalMastered: 0,
        nextMilestone: 'Complete first lesson',
    };

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

            <div className="space-y-8">
                {/* Welcome Section */}
                <motion.div
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
                    </div>
                </motion.div>

                {/* Progress Overview */}
                <motion.div
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

                {/* Domains Grid */}
                <motion.div
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

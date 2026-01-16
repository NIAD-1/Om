'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import { Map, Plus, Calendar, Trash2, ChevronRight, Target, Filter } from 'lucide-react';
import type { Roadmap } from '@/types/roadmap';
import { useAuth } from '@/contexts/auth-context';
import { getRoadmaps, deleteRoadmap } from '@/lib/firestore';
import { DOMAINS } from '@/lib/domains-config';

export default function RoadmapsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDomain, setSelectedDomain] = useState<string>('all');

    useEffect(() => {
        const loadRoadmaps = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const data = await getRoadmaps(user.uid);
                setRoadmaps(data.reverse());
            } catch (e) {
                console.error('Failed to load roadmaps', e);
            } finally {
                setLoading(false);
            }
        };

        loadRoadmaps();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!user) return;

        try {
            await deleteRoadmap(user.uid, id);
            const data = await getRoadmaps(user.uid);
            setRoadmaps(data.reverse());
        } catch (e) {
            console.error('Failed to delete roadmap', e);
        }
    };

    const getProgressPercentage = (roadmap: Roadmap) => {
        if (roadmap.curricula.length === 0) return 0;
        return Math.round((roadmap.completedCurricula.length / roadmap.curricula.length) * 100);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div id="roadmaps-header" className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Career Roadmaps</h1>
                        <p className="text-slate-400">
                            Sequential learning paths to achieve your goals
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/roadmaps/create')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Create Roadmap
                    </button>
                </div>

                {/* Domain Filter */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedDomain('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDomain === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        All
                    </button>
                    {DOMAINS.slice(0, 6).map((domain) => (
                        <button
                            key={domain.id}
                            onClick={() => setSelectedDomain(domain.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDomain === domain.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {domain.name}
                        </button>
                    ))}
                </div>

                {roadmaps.length === 0 ? (
                    <div className="card text-center py-16">
                        <Map className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No Roadmaps Yet</h2>
                        <p className="text-slate-400 mb-6">
                            Create your first career roadmap to start your journey
                        </p>
                        <button
                            onClick={() => router.push('/roadmaps/create')}
                            className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                        >
                            Create Roadmap
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {roadmaps
                            .filter(r => selectedDomain === 'all' || r.domain === selectedDomain)
                            .map((roadmap, index) => {
                                const progress = getProgressPercentage(roadmap);

                                return (
                                    <motion.div
                                        key={roadmap.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="card-hover group"
                                        onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                    <Target className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                        {roadmap.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-1 text-sm text-slate-400">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(roadmap.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            {roadmap.curricula.length} steps
                                                        </div>
                                                    </div>
                                                    {/* Progress Bar */}
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                                            <span>Progress</span>
                                                            <span>{progress}%</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete this roadmap?')) {
                                                            handleDelete(roadmap.id);
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

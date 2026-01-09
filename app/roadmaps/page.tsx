'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import { Map, Plus, Calendar, Trash2, ChevronRight, Target } from 'lucide-react';
import type { Roadmap } from '@/types/roadmap';

export default function RoadmapsPage() {
    const router = useRouter();
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('roadmaps');
        if (saved) {
            try {
                setRoadmaps(JSON.parse(saved).reverse());
            } catch (e) {
                console.error('Failed to parse roadmaps', e);
            }
        }
    }, []);

    const deleteRoadmap = (id: string) => {
        const updated = roadmaps.filter(r => r.id !== id);
        localStorage.setItem('roadmaps', JSON.stringify(updated));
        setRoadmaps(updated);
    };

    const getProgressPercentage = (roadmap: Roadmap) => {
        if (roadmap.curricula.length === 0) return 0;
        return Math.round((roadmap.completedCurricula.length / roadmap.curricula.length) * 100);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
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
                        {roadmaps.map((roadmap, index) => {
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
                                                        deleteRoadmap(roadmap.id);
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

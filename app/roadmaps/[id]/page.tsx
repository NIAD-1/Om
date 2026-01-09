'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, CheckCircle, Circle, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Roadmap, RoadmapCurriculumRef } from '@/types/roadmap';

export default function RoadmapDetailPage() {
    const router = useRouter();
    const params = useParams();
    const roadmapId = params.id as string;

    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [curricula, setCurricula] = useState<any[]>([]);

    useEffect(() => {
        // Load roadmap
        const roadmaps = JSON.parse(localStorage.getItem('roadmaps') || '[]');
        const found = roadmaps.find((r: Roadmap) => r.id === roadmapId);

        if (!found) {
            router.push('/roadmaps');
            return;
        }

        setRoadmap(found);

        // Load full curriculum details
        const allCurricula = JSON.parse(localStorage.getItem('curricula') || '[]');
        const orderedCurricula = found.curricula
            .sort((a: RoadmapCurriculumRef, b: RoadmapCurriculumRef) => a.order - b.order)
            .map((ref: RoadmapCurriculumRef) => {
                const curriculum = allCurricula.find((c: any) => c.id === ref.curriculumId);
                return {
                    ...curriculum,
                    order: ref.order,
                    locked: ref.locked,
                    completed: found.completedCurricula.includes(ref.curriculumId),
                };
            })
            .filter((c: any) => c.id); // Remove any not found

        setCurricula(orderedCurricula);
    }, [roadmapId, router]);

    const handleCurriculumClick = (curriculum: any) => {
        if (curriculum.locked) {
            alert('🔒 Complete the previous step first!');
            return;
        }
        router.push(`/learning-paths/${curriculum.id}`);
    };

    if (!roadmap) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    const progress = roadmap.curricula.length > 0
        ? Math.round((roadmap.completedCurricula.length / roadmap.curricula.length) * 100)
        : 0;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/roadmaps')}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-1">{roadmap.title}</h1>
                        <p className="text-slate-400">{roadmap.description}</p>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="card">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-white">Overall Progress</h2>
                        <span className="text-2xl font-bold text-blue-400">{progress}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                        <span>{roadmap.completedCurricula.length} of {roadmap.curricula.length} steps completed</span>
                        <span>•</span>
                        <span>{roadmap.curricula.length - roadmap.completedCurricula.length} remaining</span>
                    </div>
                </div>

                {/* Visual Progression */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Learning Path</h2>

                    {curricula.map((curriculum, idx) => {
                        const isCompleted = curriculum.completed;
                        const isCurrents = !isCompleted && !curriculum.locked;
                        const isLocked = curriculum.locked && !isCompleted;

                        return (
                            <div key={curriculum.id} className="relative">
                                {/* Connector Line */}
                                {idx < curricula.length - 1 && (
                                    <div className="absolute left-6 top-24 bottom-0 w-0.5 bg-slate-700" style={{ top: '100px', height: 'calc(100% - 100px)' }}></div>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleCurriculumClick(curriculum)}
                                    className={`card-hover relative ${isLocked ? 'opacity-60' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' :
                                            isCurrents ? 'bg-blue-500 animate-pulse' :
                                                'bg-slate-700'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle className="h-6 w-6 text-white" />
                                            ) : isLocked ? (
                                                <Lock className="h-6 w-6 text-slate-400" />
                                            ) : (
                                                <Circle className="h-6 w-6 text-white" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-blue-400">
                                                    Step {curriculum.order}
                                                </span>
                                                {isCompleted && <span className="text-xs text-green-400">✓ Completed</span>}
                                                {isCurrents && <span className="text-xs text-blue-400">→ Current</span>}
                                                {isLocked && <span className="text-xs text-slate-500">🔒 Locked</span>}
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                {curriculum.field}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span>{curriculum.modules?.length || 0} modules</span>
                                                {curriculum.domain && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="capitalize">{curriculum.domain.replace('-', ' ')}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action */}
                                        {!isLocked && (
                                            <ChevronRight className="h-6 w-6 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}

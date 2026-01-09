'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronRight,
    BookOpen,
    PlayCircle,
    Clock,
    ArrowLeft,
    Code
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import type { Module, Topic, Lesson } from '@/types/curriculum';

export default function CurriculumViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [curriculum, setCurriculum] = useState<any>(null);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const saved = localStorage.getItem('curricula');
        if (!saved) {
            router.push('/learning-paths');
            return;
        }
        try {
            const all = JSON.parse(saved);
            const found = all.find((c: any) => c.id === id);
            if (!found) {
                router.push('/learning-paths');
                return;
            }
            setCurriculum(found);
            // Expand first module by default
            if (found.modules && found.modules.length > 0) {
                setExpandedModules({ [found.modules[0].id]: true });
            }
        } catch (e) {
            console.error('Failed to parse curriculum', e);
            router.push('/learning-paths');
        }
    }, [id, router]);

    if (!curriculum) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const toggleTopic = (topicId: string) => {
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/learning-paths')}
                            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                {curriculum.field}
                            </h1>
                            <p className="text-slate-400">
                                Generated {new Date(curriculum.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/learn/${id}`)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-colors"
                    >
                        🗺️ Visual Map
                    </button>
                </div>

                {/* Modules List */}
                <div className="space-y-4">
                    {curriculum.modules.map((module: Module) => (
                        <div
                            key={module.id}
                            className="rounded-xl border border-blue-500/20 bg-slate-900/50 overflow-hidden"
                        >
                            {/* Module Header */}
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between p-6 hover:bg-slate-800/30 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">{module.name}</h2>
                                        <p className="text-sm text-slate-400">{module.description}</p>
                                    </div>
                                </div>
                                {expandedModules[module.id] ? (
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                )}
                            </button>

                            {/* Topics */}
                            <AnimatePresence>
                                {expandedModules[module.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-blue-500/10 bg-slate-900/30"
                                    >
                                        <div className="p-4 space-y-3">
                                            {module.topics.map((topic: Topic) => (
                                                <div key={topic.id} className="rounded-lg border border-slate-700/50 bg-slate-800/20">
                                                    {/* Topic Header */}
                                                    <button
                                                        onClick={() => toggleTopic(topic.id)}
                                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                                                    >
                                                        <span className="font-medium text-slate-200">{topic.name}</span>
                                                        {expandedTopics[topic.id] ? (
                                                            <ChevronDown className="h-4 w-4 text-slate-500" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-slate-500" />
                                                        )}
                                                    </button>

                                                    {/* Lessons */}
                                                    <AnimatePresence>
                                                        {expandedTopics[topic.id] && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: 'auto' }}
                                                                exit={{ height: 0 }}
                                                                className="px-4 pb-4 overflow-hidden"
                                                            >
                                                                <div className="space-y-2 pt-2 border-t border-slate-700/30">
                                                                    {topic.lessons.map((lesson: Lesson) => (
                                                                        <div
                                                                            key={lesson.id}
                                                                            className="flex items-center justify-between p-3 rounded-md bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 transition-colors group cursor-pointer"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <PlayCircle className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                                                                                <span className="text-sm text-slate-300 group-hover:text-white">
                                                                                    {lesson.name}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                                    <Clock className="h-3 w-3" />
                                                                                    {lesson.estimatedMinutes}m
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => router.push(`/learning-paths/${id}/lesson/${lesson.id}`)}
                                                                                    className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors font-medium"
                                                                                >
                                                                                    Start
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Projects Section */}
                {curriculum.projects && curriculum.projects.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-purple-400">🚀</span> Projects
                        </h2>
                        {curriculum.projects.map((project: any) => (
                            <div
                                key={project.id}
                                onClick={() => router.push(`/learning-paths/${id}/project/${project.id}`)}
                                className="card-hover cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${project.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                                                project.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-red-500/10 text-red-400'
                                                }`}>
                                                {project.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-3">{project.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>{project.estimatedHours} hours</span>
                                            <span>•</span>
                                            <span>{project.tasks?.length || 0} tasks</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Play,
    Clock,
    ChevronDown,
    ChevronRight,
    Star,
    ExternalLink,
    FileText
} from 'lucide-react';
import { FEATURED_CURRICULA, FeaturedCurriculum } from '@/lib/featured-content';
import { DocumentReader, useDocumentReader } from '@/components/reader/document-reader';

export default function FeaturedLearningPathPage() {
    const router = useRouter();
    const params = useParams();
    const pathId = params.pathId as string;
    const { readerState, openReader, closeReader } = useDocumentReader();

    const [curriculum, setCurriculum] = useState<FeaturedCurriculum | null>(null);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

    useEffect(() => {
        // Find the featured curriculum by ID
        const found = FEATURED_CURRICULA.find(c => c.id === pathId);
        if (found) {
            setCurriculum(found);
            // Expand first module by default
            if (found.modules.length > 0) {
                setExpandedModules([found.modules[0].id]);
                if (found.modules[0].topics.length > 0) {
                    setExpandedTopics([found.modules[0].topics[0].id]);
                }
            }
        }
    }, [pathId]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    const toggleTopic = (topicId: string) => {
        setExpandedTopics(prev =>
            prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
        );
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'video': return Play;
            case 'pdf': return FileText;
            case 'course': return BookOpen;
            default: return ExternalLink;
        }
    };

    if (!curriculum) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-slate-400">Learning path not found</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 text-blue-400 hover:text-blue-300"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mt-1"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="h-5 w-5 text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-medium">Featured</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{curriculum.field}</h1>
                        <p className="text-slate-400">{curriculum.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {curriculum.estimatedHours} hours
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
                                {curriculum.difficulty}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modules */}
                <div className="space-y-4">
                    {curriculum.modules.map((module, moduleIdx) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: moduleIdx * 0.1 }}
                            className="card"
                        >
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                                    <p className="text-sm text-slate-400">{module.description}</p>
                                </div>
                                {expandedModules.includes(module.id) ? (
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                )}
                            </button>

                            {expandedModules.includes(module.id) && (
                                <div className="mt-4 space-y-3">
                                    {module.topics.map((topic) => (
                                        <div key={topic.id} className="border-l-2 border-slate-700 pl-4">
                                            <button
                                                onClick={() => toggleTopic(topic.id)}
                                                className="w-full flex items-center justify-between text-left py-2"
                                            >
                                                <span className="font-medium text-slate-300">{topic.name}</span>
                                                {expandedTopics.includes(topic.id) ? (
                                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                                )}
                                            </button>

                                            {expandedTopics.includes(topic.id) && (
                                                <div className="space-y-2 pb-2">
                                                    {topic.lessons.map((lesson) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="p-3 rounded-lg bg-slate-800/50 space-y-2"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-white">{lesson.name}</span>
                                                                <span className="text-xs text-slate-500">
                                                                    {lesson.estimatedMinutes} min
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-400">{lesson.content.summary}</p>

                                                            {/* Resources */}
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {lesson.content.resources.map((resource, idx) => {
                                                                    const Icon = getResourceIcon(resource.type);
                                                                    return (
                                                                        <button
                                                                            key={idx}
                                                                            onClick={() => {
                                                                                if (resource.type === 'video' && resource.url.includes('youtube')) {
                                                                                    openReader(resource.url, resource.title, 'video');
                                                                                } else if (resource.type === 'pdf') {
                                                                                    openReader(resource.url, resource.title, 'pdf');
                                                                                } else {
                                                                                    window.open(resource.url, '_blank');
                                                                                }
                                                                            }}
                                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm transition-colors"
                                                                        >
                                                                            <Icon className="h-4 w-4" />
                                                                            {resource.source}
                                                                            {resource.duration && (
                                                                                <span className="text-blue-300/60">• {resource.duration}</span>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Document Reader */}
            {readerState.isOpen && (
                <DocumentReader
                    url={readerState.url}
                    title={readerState.title}
                    type={readerState.type}
                    onClose={closeReader}
                />
            )}
        </DashboardLayout>
    );
}

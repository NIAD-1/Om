'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Sparkles, Copy, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { saveRoadmap, saveCurriculum } from '@/lib/firestore';

export default function CreateRoadmapManualPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const exampleRoadmap = {
        title: "AI Engineer Roadmap",
        description: "Complete path from basics to advanced AI engineering",
        domain: "technology",
        curricula: [
            {
                title: "Data Analysis Fundamentals",
                order: 1,
                modules: [
                    {
                        id: "module-1",
                        name: "Python Basics",
                        topics: [
                            {
                                id: "topic-1",
                                name: "Python Fundamentals",
                                lessons: [
                                    {
                                        id: "lesson-1",
                                        name: "Variables and Data Types",
                                        estimatedMinutes: 45,
                                        prerequisites: [],
                                        content: {
                                            summary: "Learn about **variables**, **data types**, and basic Python syntax.\\n\\nYou'll understand:\\n- How to declare variables\\n- Different data types (int, float, string)\\n- Type conversion",
                                            resources: [
                                                {
                                                    type: "video",
                                                    title: "Python Variables Tutorial",
                                                    url: "https://youtube.com/watch?v=example",
                                                    duration: "20 min",
                                                    authority: "Programming with Mosh"
                                                },
                                                {
                                                    type: "article",
                                                    title: "Python Data Types Guide",
                                                    url: "https://realpython.com/python-data-types",
                                                    authority: "Real Python"
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                projects: [
                    {
                        id: "project-1",
                        name: "Data Analysis Project",
                        description: "Analyze a real dataset",
                        difficulty: "beginner",
                        estimatedHours: 5,
                        tasks: [
                            {
                                id: "task-1",
                                title: "Load the dataset",
                                description: "Use pandas to load CSV data",
                                estimatedMinutes: 30
                            }
                        ]
                    }
                ]
            },
            {
                title: "Machine Learning Basics",
                order: 2,
                modules: [],
                projects: []
            }
        ]
    };

    const loadExample = () => {
        setJsonInput(JSON.stringify(exampleRoadmap, null, 2));
        setError('');
    };

    const handleCreate = async () => {
        setLoading(true);
        setError('');

        try {
            const roadmapData = JSON.parse(jsonInput);

            // Validation
            if (!roadmapData.title || !roadmapData.curricula) {
                throw new Error('Roadmap must have "title" and "curricula" fields');
            }

            if (!Array.isArray(roadmapData.curricula) || roadmapData.curricula.length === 0) {
                throw new Error('Curricula must be a non-empty array');
            }

            // Generate IDs for roadmap and curricula
            const roadmapId = crypto.randomUUID();
            const curricula: any[] = [];
            const curriculaRefs: any[] = [];

            roadmapData.curricula.forEach((curriculum: any, idx: number) => {
                const curriculumId = crypto.randomUUID();

                curricula.push({
                    ...curriculum,
                    id: curriculumId,
                    field: curriculum.title,
                    domain: roadmapData.domain || 'other',
                    createdAt: new Date().toISOString(),
                });

                curriculaRefs.push({
                    curriculumId,
                    order: curriculum.order || idx + 1,
                    locked: idx > 0,
                });
            });

            // Save curricula to Firestore
            if (user) {
                for (const curriculum of curricula) {
                    await saveCurriculum(user.uid, {
                        ...curriculum,
                        isRoadmapCurriculum: true,
                    });
                }
            }

            // Save roadmap
            const roadmap = {
                id: roadmapId,
                title: roadmapData.title,
                description: roadmapData.description || '',
                domain: roadmapData.domain || 'other',
                curricula: curriculaRefs,
                createdAt: new Date().toISOString(),
                completedCurricula: [],
            };

            if (user) {
                await saveRoadmap(user.uid, roadmap);
            }

            router.push('/roadmaps');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON format');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/roadmaps/create')}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Create Roadmap from JSON</h1>
                        <p className="text-slate-400">Paste your custom roadmap JSON</p>
                    </div>
                </div>

                {/* Example Format */}
                <div className="card bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white">📝 Example Format</h3>
                        <button
                            onClick={loadExample}
                            className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Load Example
                        </button>
                    </div>
                    <p className="text-sm text-slate-300">
                        Your JSON should include: <code className="text-blue-400">title</code>, <code className="text-blue-400">description</code>, <code className="text-blue-400">domain</code>, and <code className="text-blue-400">curricula</code> array.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        Click "Load Example" to see the full format with modules, lessons, and projects.
                    </p>
                </div>

                {/* JSON Input */}
                <div className="card">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Roadmap JSON *
                    </label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => {
                            setJsonInput(e.target.value);
                            setError('');
                        }}
                        placeholder='{"title": "Your Roadmap", "curricula": [...]}'
                        rows={20}
                        className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    />

                    {error && (
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            ❌ {error}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleCreate}
                        disabled={!jsonInput.trim() || loading}
                        className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Create Roadmap
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => router.push('/roadmaps')}
                        className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

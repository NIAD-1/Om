'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Sparkles, FileJson, Loader2, Youtube } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { saveRoadmap, saveCurriculum } from '@/lib/firestore';

export default function CreateRoadmapPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'ai' | 'youtube' | 'manual'>('ai');
    const [goal, setGoal] = useState('');
    const [domain, setDomain] = useState('technology');
    const [loading, setLoading] = useState(false);

    const domains = [
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

    const generateRoadmap = async () => {
        if (!goal.trim()) {
            alert('Please enter a career goal');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal, domain }),
            });

            if (!response.ok) throw new Error('Failed to generate roadmap');

            const roadmapData = await response.json();

            // Save curricula and roadmap
            const roadmapId = crypto.randomUUID();
            const curricula: any[] = [];
            const curriculaRefs: any[] = [];

            roadmapData.curricula.forEach((curriculum: any, idx: number) => {
                const curriculumId = crypto.randomUUID();

                curricula.push({
                    ...curriculum,
                    id: curriculumId,
                    field: curriculum.title,
                    domain: roadmapData.domain || domain,
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
                        isRoadmapCurriculum: true, // Part of roadmap, hide from Learning Paths
                    });
                }
            }

            // Save roadmap
            const roadmap = {
                id: roadmapId,
                title: roadmapData.title,
                description: roadmapData.description || '',
                domain: roadmapData.domain || domain,
                curricula: curriculaRefs,
                createdAt: new Date().toISOString(),
                completedCurricula: [],
            };

            if (user) {
                await saveRoadmap(user.uid, roadmap);
            }

            router.push('/roadmaps');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate roadmap. Please try again.');
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
                        onClick={() => router.push('/roadmaps')}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Create Roadmap</h1>
                        <p className="text-slate-400">Choose how to build your learning path</p>
                    </div>
                </div>

                {/* Tabs */}
                <div id="create-roadmap-options" className="flex gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'ai'
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Sparkles className="h-5 w-5" />
                        AI Generate
                    </button>
                    <button
                        onClick={() => setActiveTab('youtube')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'youtube'
                            ? 'bg-gradient-to-r from-red-500 to-purple-500 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Youtube className="h-5 w-5" />
                        YouTube
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'manual'
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <FileJson className="h-5 w-5" />
                        Manual JSON
                    </button>
                </div>

                {/* AI Generation */}
                {activeTab === 'ai' && (
                    <div className="card space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">🚀 AI Roadmap Generator</h3>
                            <p className="text-sm text-slate-400">
                                Tell us your career goal and AI will create a complete roadmap with curricula, lessons, and projects.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Career Goal *
                            </label>
                            <input
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g., Become an AI Engineer, Master Full Stack Development"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Domain
                            </label>
                            <select
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                            >
                                {domains.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.emoji} {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={generateRoadmap}
                            disabled={!goal.trim() || loading}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generating Roadmap...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Generate Roadmap
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* YouTube */}
                {activeTab === 'youtube' && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-white mb-2">📺 Create from YouTube Video</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Turn a long YouTube video (like a 23-hour course) into a structured roadmap.
                            Each chapter/timestamp becomes a lesson with the video embedded at the right moment.
                        </p>
                        <button
                            onClick={() => router.push('/roadmaps/create/youtube')}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white font-medium transition-colors"
                        >
                            Continue to YouTube Editor
                        </button>
                    </div>
                )}

                {/* Manual JSON */}
                {activeTab === 'manual' && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-white mb-2">📝 Manual JSON Input</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Create a roadmap from your own custom JSON format. Perfect if you have your own curriculum structure.
                        </p>
                        <button
                            onClick={() => router.push('/roadmaps/create/manual')}
                            className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                        >
                            Continue to JSON Editor
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

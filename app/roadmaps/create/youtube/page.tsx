'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Youtube, Loader2, Clock, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { saveRoadmap, saveCurriculum } from '@/lib/firestore';

interface TimestampSection {
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
}

export default function CreateFromYouTubePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [videoUrl, setVideoUrl] = useState('');
    const [roadmapTitle, setRoadmapTitle] = useState('');
    const [domain, setDomain] = useState('technology');
    const [sections, setSections] = useState<TimestampSection[]>([]);
    const [loading, setLoading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [timestampInput, setTimestampInput] = useState('');

    const domains = [
        { id: 'technology', name: 'Technology', emoji: '💻' },
        { id: 'finance', name: 'Finance', emoji: '💰' },
        { id: 'business', name: 'Business', emoji: '📊' },
        { id: 'sciences', name: 'Sciences', emoji: '🔬' },
        { id: 'humanities', name: 'Humanities', emoji: '📚' },
        { id: 'other', name: 'Other', emoji: '📖' },
    ];

    const getVideoId = (url: string) => {
        if (url.includes('watch?v=')) {
            return url.split('watch?v=')[1]?.split('&')[0];
        }
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1]?.split('?')[0];
        }
        return null;
    };

    const parseTimestamps = () => {
        setParsing(true);

        // Parse timestamp format like:
        // 0:00 Introduction
        // 15:30 Variables and Data Types
        // 1:23:45 Functions
        const lines = timestampInput.split('\n').filter(line => line.trim());
        const parsed: TimestampSection[] = [];

        const timeRegex = /^(\d{1,2}:)?(\d{1,2}):(\d{2})\s+(.+)$/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const match = line.match(timeRegex);

            if (match) {
                const startTime = line.match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})/)?.[0] || '0:00';
                const title = match[4].trim();

                // Get end time from next section or empty
                let endTime = '';
                if (i < lines.length - 1) {
                    const nextMatch = lines[i + 1].match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})/);
                    if (nextMatch) {
                        endTime = nextMatch[0];
                    }
                }

                parsed.push({
                    id: crypto.randomUUID(),
                    startTime,
                    endTime,
                    title,
                    description: '',
                });
            }
        }

        setSections(parsed);
        setParsing(false);
    };

    const addSection = () => {
        setSections([...sections, {
            id: crypto.randomUUID(),
            startTime: '',
            endTime: '',
            title: '',
            description: '',
        }]);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const updateSection = (id: string, field: keyof TimestampSection, value: string) => {
        setSections(sections.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const timeToSeconds = (time: string): number => {
        const parts = time.split(':').map(Number);
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return 0;
    };

    const createRoadmap = async () => {
        if (!videoUrl || !roadmapTitle || sections.length === 0) {
            alert('Please fill in all required fields and add at least one section');
            return;
        }

        setLoading(true);
        const videoId = getVideoId(videoUrl);

        try {
            // Create curricula from sections
            const roadmapId = crypto.randomUUID();
            const curriculaRefs: any[] = [];
            const curricula: any[] = [];

            // Group sections into curricula (each section becomes a lesson in one curriculum)
            const curriculumId = crypto.randomUUID();
            const lessons = sections.map((section, idx) => ({
                id: crypto.randomUUID(),
                name: section.title,
                estimatedMinutes: section.endTime
                    ? Math.round((timeToSeconds(section.endTime) - timeToSeconds(section.startTime)) / 60)
                    : 30,
                prerequisites: idx > 0 ? [sections[idx - 1].id] : [],
                content: {
                    summary: section.description || `Learn about ${section.title}`,
                    resources: [{
                        type: 'video',
                        title: section.title,
                        url: `https://www.youtube.com/watch?v=${videoId}&t=${timeToSeconds(section.startTime)}`,
                        duration: section.endTime
                            ? `${section.startTime} - ${section.endTime}`
                            : `Starting at ${section.startTime}`,
                        authority: 'YouTube',
                    }],
                },
            }));

            curricula.push({
                id: curriculumId,
                field: roadmapTitle,
                domain,
                createdAt: new Date().toISOString(),
                modules: [{
                    id: 'module-1',
                    name: roadmapTitle,
                    topics: [{
                        id: 'topic-1',
                        name: 'Video Lessons',
                        lessons,
                    }],
                }],
                projects: [],
            });

            curriculaRefs.push({
                curriculumId,
                order: 1,
                locked: false,
            });

            // Save curricula to Firestore
            if (user) {
                for (const curriculum of curricula) {
                    await saveCurriculum(user.uid, curriculum);
                }
            }

            // Save roadmap
            const roadmap = {
                id: roadmapId,
                title: roadmapTitle,
                description: `Roadmap created from YouTube video`,
                domain,
                curricula: curriculaRefs,
                createdAt: new Date().toISOString(),
                completedCurricula: [],
            };

            if (user) {
                await saveRoadmap(user.uid, roadmap);
            }

            router.push(`/roadmaps/${roadmapId}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create roadmap');
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
                        <h1 className="text-3xl font-bold text-white">Create from YouTube</h1>
                        <p className="text-slate-400">Turn a long video into a structured roadmap</p>
                    </div>
                </div>

                {/* Video URL */}
                <div className="card space-y-4">
                    <div className="flex items-center gap-2 text-red-500">
                        <Youtube className="h-6 w-6" />
                        <h2 className="text-lg font-semibold text-white">Video URL</h2>
                    </div>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                    />
                    {videoUrl && getVideoId(videoUrl) && (
                        <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                                src={`https://www.youtube.com/embed/${getVideoId(videoUrl)}`}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>

                {/* Roadmap Details */}
                <div className="card space-y-4">
                    <h2 className="text-lg font-semibold text-white">Roadmap Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                        <input
                            type="text"
                            value={roadmapTitle}
                            onChange={(e) => setRoadmapTitle(e.target.value)}
                            placeholder="e.g., Python Full Course Roadmap"
                            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Domain</label>
                        <select
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                        >
                            {domains.map(d => (
                                <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Video Sections</h2>
                        </div>
                        <button
                            onClick={addSection}
                            className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Add Section
                        </button>
                    </div>

                    {/* Paste Timestamps */}
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Paste Timestamps (from video description)
                        </label>
                        <textarea
                            value={timestampInput}
                            onChange={(e) => setTimestampInput(e.target.value)}
                            placeholder={`0:00 Introduction\n15:30 Variables and Data Types\n45:00 Control Flow\n1:23:45 Functions`}
                            rows={5}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={parseTimestamps}
                            disabled={!timestampInput.trim()}
                            className="mt-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium"
                        >
                            {parsing ? 'Parsing...' : 'Parse Timestamps'}
                        </button>
                    </div>

                    {/* Sections List */}
                    {sections.length > 0 && (
                        <div className="space-y-3">
                            {sections.map((section, idx) => (
                                <div key={section.id} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <div className="text-blue-400 font-bold text-sm mt-1">#{idx + 1}</div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={section.startTime}
                                                    onChange={(e) => updateSection(section.id, 'startTime', e.target.value)}
                                                    placeholder="0:00"
                                                    className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                                                />
                                                <span className="text-slate-500 self-center">→</span>
                                                <input
                                                    type="text"
                                                    value={section.endTime}
                                                    onChange={(e) => updateSection(section.id, 'endTime', e.target.value)}
                                                    placeholder="15:30"
                                                    className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                                placeholder="Section title"
                                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeSection(section.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {sections.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                            Add sections manually or paste timestamps from the video description
                        </p>
                    )}
                </div>

                {/* Create Button */}
                <button
                    onClick={createRoadmap}
                    disabled={!videoUrl || !roadmapTitle || sections.length === 0 || loading}
                    className="w-full py-4 rounded-lg bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 disabled:opacity-50 text-white font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Creating Roadmap...
                        </>
                    ) : (
                        <>
                            <Youtube className="h-5 w-5" />
                            Create Roadmap from Video
                        </>
                    )}
                </button>
            </div>
        </DashboardLayout>
    );
}

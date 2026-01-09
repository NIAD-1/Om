'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Clock, BookOpen, ExternalLink } from 'lucide-react';
import AITutorSidebar from '@/components/ai-tutor/ai-tutor-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getCurricula, saveProgress, getProgress } from '@/lib/firestore';

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const curriculumId = params.id as string;
    const lessonId = params.lessonId as string;
    const { user } = useAuth();

    const [lesson, setLesson] = useState<any>(null);
    const [curriculumTitle, setCurriculumTitle] = useState('');

    useEffect(() => {
        const loadLesson = async () => {
            if (!user) return;

            try {
                const curricula = await getCurricula(user.uid);
                const curriculum = curricula.find((c: any) => c.id === curriculumId);

                if (!curriculum) {
                    router.push('/learning-paths');
                    return;
                }

                setCurriculumTitle(curriculum.field);

                // Find lesson
                let foundLesson: any = null;
                curriculum.modules?.forEach((module: any) => {
                    module.topics?.forEach((topic: any) => {
                        topic.lessons?.forEach((l: any) => {
                            if (l.id === lessonId) {
                                foundLesson = l;
                            }
                        });
                    });
                });

                if (foundLesson) {
                    setLesson(foundLesson);
                } else {
                    router.push(`/learning-paths/${curriculumId}`);
                }
            } catch (error) {
                console.error('Failed to load lesson', error);
            }
        };

        loadLesson();
    }, [curriculumId, lessonId, router, user]);

    if (!lesson) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    const lessonContext = `
        Lesson: ${lesson.name}
        Summary: ${lesson.content?.summary || 'No summary available'}
        Resources: ${lesson.content?.resources?.map((r: any) => r.title).join(', ') || 'None'}
    `;

    const getYouTubeEmbed = (url: string): { videoId: string | null, startTime: number } => {
        let videoId = null;
        let startTime = 0;

        // Extract video ID
        if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }

        // Extract timestamp (t= or start=)
        const timeMatch = url.match(/[?&]t=(\d+)/);
        if (timeMatch) {
            startTime = parseInt(timeMatch[1], 10);
        }

        return { videoId, startTime };
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-24">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/learning-paths/${curriculumId}`)}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">{curriculumTitle}</p>
                        <h1 className="text-3xl font-bold text-white">{lesson.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{lesson.estimatedMinutes} minutes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lesson Content */}
                {lesson.content?.summary && (
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">Lesson Overview</h2>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {lesson.content.summary}
                            </p>
                        </div>
                    </div>
                )}

                {/* Resources */}
                {lesson.content?.resources && lesson.content.resources.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-semibold text-white mb-4">📚 Learning Resources</h2>
                        <div className="space-y-6">
                            {lesson.content.resources.map((resource: any, idx: number) => {
                                const ytData = resource.type === 'video' ? getYouTubeEmbed(resource.url) : { videoId: null, startTime: 0 };
                                const isArticle = resource.type === 'article';
                                const isPaper = resource.type === 'paper' || resource.type === 'journal';

                                return (
                                    <div key={idx} className="border border-slate-700 rounded-lg overflow-hidden">
                                        {/* Resource Header */}
                                        <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 capitalize">
                                                            {resource.type}
                                                        </span>
                                                        {resource.duration && (
                                                            <span className="text-xs text-slate-500">{resource.duration}</span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-medium text-white">{resource.title}</h3>
                                                    {resource.authority && (
                                                        <p className="text-sm text-slate-400 mt-1">by {resource.authority}</p>
                                                    )}
                                                </div>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    Open
                                                </a>
                                            </div>
                                        </div>

                                        {/* Embedded Content */}
                                        <div className="bg-slate-950">
                                            {ytData.videoId && (
                                                <div className="aspect-video">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${ytData.videoId}${ytData.startTime > 0 ? `?start=${ytData.startTime}` : ''}`}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            )}

                                            {(isArticle || isPaper) && (
                                                <div className="p-4">
                                                    <p className="text-sm text-slate-400">
                                                        {isPaper ? '📑 Research Paper/Journal' : '📄 Article'} - Click "Open" to read the full content.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        onClick={async () => {
                            if (!user) return;

                            try {
                                const existing = await getProgress(user.uid, curriculumId);
                                if (!existing.includes(lessonId)) {
                                    existing.push(lessonId);
                                    await saveProgress(user.uid, curriculumId, existing);
                                    alert('✅ Lesson marked as complete!');
                                }
                            } catch (error) {
                                console.error('Failed to save progress', error);
                            }
                        }}
                        className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                    >
                        Mark Complete
                    </button>
                    <button
                        onClick={() => router.push(`/learning-paths/${curriculumId}/quiz/${lessonId}`)}
                        className="px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors"
                    >
                        Take Quiz
                    </button>
                    <button
                        onClick={() => router.push(`/learning-paths/${curriculumId}/exam/${lessonId}`)}
                        className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                    >
                        Take Exam
                    </button>
                </div>
            </div>

            {/* AI Tutor Sidebar */}
            <AITutorSidebar lessonName={lesson.name} lessonContext={lessonContext} />
        </DashboardLayout>
    );
}

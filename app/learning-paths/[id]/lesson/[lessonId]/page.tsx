'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Clock, BookOpen, ExternalLink, Play, SkipForward } from 'lucide-react';
import AITutorSidebar from '@/components/ai-tutor/ai-tutor-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getCurricula, saveProgress, getProgress, saveVideoProgress, logActivity } from '@/lib/firestore';
import YouTube from 'react-youtube';
import { useRef } from 'react';

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const curriculumId = params.id as string;
    const lessonId = params.lessonId as string;
    const { user } = useAuth();

    const [lesson, setLesson] = useState<any>(null);
    const [curriculumTitle, setCurriculumTitle] = useState('');
    const [savedTimestamp, setSavedTimestamp] = useState(0);
    const videoStartTimeRef = useRef<number>(0);
    const lastSavedTimeRef = useRef<number>(0);
    const playerRef = useRef<any>(null);
    const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const endTimeCheckRef = useRef<NodeJS.Timeout | null>(null);

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

                    // Load saved video progress
                    const progressData = await getProgress(user.uid, curriculumId);
                    if (progressData.timestamps?.[lessonId]) {
                        setSavedTimestamp(progressData.timestamps[lessonId]);
                    }
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

    const getYouTubeEmbed = (url: string, resource?: any): { videoId: string | null, startTime: number, endTime: number | null, chapters: Array<{ title: string, time: number }> } => {
        let videoId = null;
        let startTime = 0;
        let endTime: number | null = null;
        let chapters: Array<{ title: string, time: number }> = [];

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

        // Check for startTime/endTime in resource object
        if (resource?.startTime) {
            startTime = resource.startTime;
        }
        if (resource?.endTime) {
            endTime = resource.endTime;
        }
        if (resource?.chapters) {
            chapters = resource.chapters;
        }

        return { videoId, startTime, endTime, chapters };
    };

    // Function to seek to specific timestamp
    const seekToTime = (time: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(time, true);
        }
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                                const ytData = resource.type === 'video' ? getYouTubeEmbed(resource.url, resource) : { videoId: null, startTime: 0, endTime: null, chapters: [] };
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
                                                <div className="aspect-video relative">
                                                    <YouTube
                                                        videoId={ytData.videoId}
                                                        opts={{
                                                            height: '100%',
                                                            width: '100%',
                                                            playerVars: {
                                                                autoplay: 0,
                                                                start: savedTimestamp > 0 ? savedTimestamp : (ytData.startTime > 0 ? ytData.startTime : undefined),
                                                            },
                                                        }}
                                                        className="absolute inset-0 w-full h-full"
                                                        onReady={(event) => {
                                                            playerRef.current = event.target;
                                                        }}
                                                        onPlay={async (event) => {
                                                            // Record when video started playing
                                                            const currentTime = await event.target.getCurrentTime();
                                                            videoStartTimeRef.current = currentTime;
                                                            lastSavedTimeRef.current = currentTime;

                                                            // Start auto-save interval (every 30 seconds)
                                                            if (autoSaveIntervalRef.current) {
                                                                clearInterval(autoSaveIntervalRef.current);
                                                            }
                                                            autoSaveIntervalRef.current = setInterval(async () => {
                                                                if (playerRef.current && user) {
                                                                    const time = await playerRef.current.getCurrentTime();
                                                                    await saveVideoProgress(user.uid, curriculumId, lessonId, Math.floor(time));

                                                                    // Log activity every 30 seconds of watching
                                                                    const minutesWatched = Math.floor((time - lastSavedTimeRef.current) / 60);
                                                                    if (minutesWatched >= 1) {
                                                                        await logActivity(user.uid, {
                                                                            type: 'video_watch',
                                                                            curriculumId,
                                                                            curriculumTitle,
                                                                            lessonId,
                                                                            lessonName: lesson?.name || 'Unknown Lesson',
                                                                            minutesSpent: minutesWatched
                                                                        });
                                                                        lastSavedTimeRef.current = time;
                                                                    }
                                                                }
                                                            }, 30000);
                                                        }}
                                                        onPause={async (event) => {
                                                            if (user) {
                                                                const time = await event.target.getCurrentTime();
                                                                await saveVideoProgress(user.uid, curriculumId, lessonId, Math.floor(time));

                                                                // Log time watched since start/last save
                                                                const minutesWatched = Math.max(1, Math.floor((time - videoStartTimeRef.current) / 60));
                                                                if (minutesWatched > 0) {
                                                                    await logActivity(user.uid, {
                                                                        type: 'video_watch',
                                                                        curriculumId,
                                                                        curriculumTitle,
                                                                        lessonId,
                                                                        lessonName: lesson?.name || 'Unknown Lesson',
                                                                        minutesSpent: minutesWatched
                                                                    });
                                                                }

                                                                // Clear interval
                                                                if (autoSaveIntervalRef.current) {
                                                                    clearInterval(autoSaveIntervalRef.current);
                                                                }
                                                            }
                                                        }}
                                                        onEnd={async (event) => {
                                                            if (user) {
                                                                const duration = await event.target.getDuration();
                                                                const minutesWatched = Math.max(1, Math.floor((duration - videoStartTimeRef.current) / 60));

                                                                await logActivity(user.uid, {
                                                                    type: 'video_watch',
                                                                    curriculumId,
                                                                    curriculumTitle,
                                                                    lessonId,
                                                                    lessonName: lesson?.name || 'Unknown Lesson',
                                                                    minutesSpent: minutesWatched
                                                                });

                                                                if (autoSaveIntervalRef.current) {
                                                                    clearInterval(autoSaveIntervalRef.current);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Video Chapters/Timestamps */}
                                            {ytData.chapters && ytData.chapters.length > 0 && (
                                                <div className="p-3 bg-slate-800/50 border-t border-slate-700">
                                                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                                        <SkipForward className="h-3 w-3" />
                                                        Chapters
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ytData.chapters.map((chapter, cidx) => (
                                                            <button
                                                                key={cidx}
                                                                onClick={() => seekToTime(chapter.time)}
                                                                className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors flex items-center gap-1"
                                                            >
                                                                <Play className="h-3 w-3" />
                                                                {formatTime(chapter.time)} - {chapter.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timestamp indicator */}
                                            {(ytData.startTime > 0 || ytData.endTime) && (
                                                <div className="px-3 py-2 bg-blue-500/10 border-t border-blue-500/20">
                                                    <p className="text-xs text-blue-400">
                                                        📍 Playing: {formatTime(ytData.startTime)}
                                                        {ytData.endTime && ` - ${formatTime(ytData.endTime)}`}
                                                        {ytData.endTime && ` (${formatTime(ytData.endTime - ytData.startTime)} segment)`}
                                                    </p>
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
                                const savedData = await getProgress(user.uid, curriculumId);
                                const existing = savedData.completedLessons;

                                // Also update local timestamps state if needed, but the video player uses direct check
                                // However, getYouTubeEmbed helper might need the saved timestamp
                                const savedTimestamp = savedData.timestamps?.[lessonId] || 0;
                                if (savedTimestamp > 0) {
                                    // Hack: update the YouTube embed helper logic or state to reflect this start time?
                                    // Actually, getYouTubeEmbed takes a URL. We should likely pass the saved time into the player props directly.
                                    // But the loop below uses getYouTubeEmbed.
                                }
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

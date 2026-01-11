'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getCurricula, getProgress, saveProgress } from '@/lib/firestore';

interface Question {
    id: string;
    type: 'multiple-choice' | 'code';
    question: string;
    options?: string[];
    correctAnswer?: number;
    starterCode?: string;
    testCases?: Array<{ input: string; expected: string }>;
    explanation: string;
    points: number;
}

interface Exam {
    questions: Question[];
    passingScore: number;
    totalPoints: number;
}

export default function ExamPage() {
    const router = useRouter();
    const params = useParams();
    const curriculumId = params.id as string;
    const lessonId = params.lessonId as string;
    const { user } = useAuth();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [lessonName, setLessonName] = useState('');

    useEffect(() => {
        const generateExam = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Load lesson details from Firestore
                const curricula = await getCurricula(user.uid);
                const curriculum = curricula.find((c: any) => c.id === curriculumId);

                if (!curriculum) {
                    setLoading(false);
                    return;
                }

                let lesson: any = null;
                curriculum.modules?.forEach((module: any) => {
                    module.topics?.forEach((topic: any) => {
                        const found = topic.lessons?.find((l: any) => l.id === lessonId);
                        if (found) lesson = found;
                    });
                });

                if (!lesson) {
                    setLoading(false);
                    return;
                }
                setLessonName(lesson.name);

                // Generate exam
                const response = await fetch('/api/generate-exam', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonContent: lesson.content?.summary || '',
                        lessonName: lesson.name,
                    }),
                });

                if (!response.ok) throw new Error('Failed to generate exam');

                const examData = await response.json();
                setExam(examData);
            } catch (error) {
                console.error('Exam generation error:', error);
                alert('Failed to generate exam. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        generateExam();
    }, [curriculumId, lessonId, user]);

    const handleSubmit = async () => {
        if (!exam || !user) return;

        let earnedPoints = 0;
        exam.questions.forEach(q => {
            if (q.type === 'multiple-choice' && answers[q.id] === q.correctAnswer) {
                earnedPoints += q.points;
            }
            // Code questions would need actual testing - for now, give partial credit if answered
            if (q.type === 'code' && answers[q.id]?.trim()) {
                earnedPoints += q.points * 0.5; // Placeholder
            }
        });

        const percentage = (earnedPoints / exam.totalPoints) * 100;
        setScore(percentage);
        setSubmitted(true);

        // Save result if passed
        if (percentage >= exam.passingScore) {
            try {
                const savedData = await getProgress(user.uid, curriculumId);
                const existing = savedData.completedLessons;
                if (!existing.includes(lessonId)) {
                    existing.push(lessonId);
                    await saveProgress(user.uid, curriculumId, existing);
                }
            } catch (error) {
                console.error('Failed to save progress', error);
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-slate-400">Generating your exam...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!exam) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto p-6">
                    <p className="text-red-400">Failed to load exam</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/learning-paths/${curriculumId}/lesson/${lessonId}`)}
                            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{lessonName} - Exam</h1>
                            <p className="text-sm text-slate-400">
                                Pass with {exam.passingScore}% or higher to unlock next lessons
                            </p>
                        </div>
                    </div>
                    {submitted && (
                        <div className={`px-4 py-2 rounded-lg ${score >= exam.passingScore ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            Score: {score.toFixed(1)}%
                        </div>
                    )}
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {exam.questions.map((q, idx) => (
                        <div key={q.id} className="card">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-medium text-sm">
                                    Q{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium mb-4">{q.question}</p>

                                    {q.type === 'multiple-choice' && q.options && (
                                        <div className="space-y-2">
                                            {q.options.map((option, optIdx) => (
                                                <label
                                                    key={optIdx}
                                                    className={`block p-3 rounded-lg border cursor-pointer transition-colors ${submitted
                                                        ? optIdx === q.correctAnswer
                                                            ? 'border-green-500 bg-green-500/10'
                                                            : answers[q.id] === optIdx
                                                                ? 'border-red-500 bg-red-500/10'
                                                                : 'border-slate-700 bg-slate-800/30'
                                                        : answers[q.id] === optIdx
                                                            ? 'border-blue-500 bg-blue-500/10'
                                                            : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        checked={answers[q.id] === optIdx}
                                                        onChange={() => !submitted && setAnswers({ ...answers, [q.id]: optIdx })}
                                                        disabled={submitted}
                                                        className="mr-3"
                                                    />
                                                    <span className="text-slate-200">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'code' && (
                                        <textarea
                                            value={answers[q.id] || q.starterCode || ''}
                                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                            disabled={submitted}
                                            className="w-full h-48 px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                                            placeholder="Write your code here..."
                                        />
                                    )}

                                    {submitted && (
                                        <div className="mt-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                                            <p className="text-sm text-slate-300">
                                                <strong className="text-blue-400">Explanation:</strong> {q.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                {!submitted ? (
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg transition-colors"
                    >
                        Submit Exam
                    </button>
                ) : (
                    <div className="card text-center">
                        {score >= exam.passingScore ? (
                            <>
                                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Congratulations! 🎉</h2>
                                <p className="text-slate-300 mb-4">
                                    You passed with {score.toFixed(1)}%! The next lessons are now unlocked.
                                </p>
                                <button
                                    onClick={() => router.push(`/learning-paths/${curriculumId}`)}
                                    className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium"
                                >
                                    Continue Learning
                                </button>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Keep Trying!</h2>
                                <p className="text-slate-300 mb-4">
                                    You scored {score.toFixed(1)}%. You need {exam.passingScore}% to pass.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
                                >
                                    Retake Exam
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

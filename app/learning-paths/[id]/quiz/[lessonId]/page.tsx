'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const curriculumId = params.id as string;
    const lessonId = params.lessonId as string;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [lessonName, setLessonName] = useState('');

    useEffect(() => {
        const generateQuiz = async () => {
            const curricula = JSON.parse(localStorage.getItem('curricula') || '[]');
            const curriculum = curricula.find((c: any) => c.id === curriculumId);

            if (!curriculum) return;

            let lesson: any = null;
            curriculum.modules?.forEach((module: any) => {
                module.topics?.forEach((topic: any) => {
                    const found = topic.lessons?.find((l: any) => l.id === lessonId);
                    if (found) lesson = found;
                });
            });

            if (!lesson) return;
            setLessonName(lesson.name);

            try {
                const response = await fetch('/api/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonContent: lesson.content?.summary || '',
                        lessonName: lesson.name,
                    }),
                });

                if (!response.ok) throw new Error('Failed to generate quiz');

                const data = await response.json();
                setQuestions(data.questions || []);
            } catch (error) {
                console.error('Quiz generation error:', error);
                alert('Failed to generate quiz. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        generateQuiz();
    }, [curriculumId, lessonId]);

    const handleSubmit = () => {
        let correct = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correct++;
            }
        });
        setScore(Math.round((correct / questions.length) * 100));
        setSubmitted(true);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
                        <p className="text-slate-400">Generating quick quiz...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6 pb-24">
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
                            <h1 className="text-2xl font-bold text-white">Quick Quiz</h1>
                            <p className="text-sm text-slate-400">{lessonName}</p>
                        </div>
                    </div>
                    {submitted && (
                        <div className={`px-4 py-2 rounded-lg ${score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {score}%
                        </div>
                    )}
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="card">
                            <p className="font-medium text-white mb-3">
                                {idx + 1}. {q.question}
                            </p>
                            <div className="space-y-2">
                                {q.options.map((option, optIdx) => (
                                    <label
                                        key={optIdx}
                                        className={`block p-3 rounded-lg border cursor-pointer transition-colors ${submitted
                                                ? optIdx === q.correctAnswer
                                                    ? 'border-green-500 bg-green-500/10'
                                                    : answers[q.id] === optIdx
                                                        ? 'border-red-500 bg-red-500/10'
                                                        : 'border-slate-700'
                                                : answers[q.id] === optIdx
                                                    ? 'border-yellow-500 bg-yellow-500/10'
                                                    : 'border-slate-700 hover:border-slate-600'
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
                            {submitted && (
                                <p className="mt-3 text-sm text-slate-400">
                                    💡 {q.explanation}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Submit/Results */}
                {!submitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length !== questions.length}
                        className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-semibold transition-colors"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <div className="card text-center">
                        {score >= 70 ? (
                            <>
                                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                                <h2 className="text-xl font-bold text-white mb-2">Great Job! 🎉</h2>
                                <p className="text-slate-300 mb-4">You scored {score}%</p>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                                <h2 className="text-xl font-bold text-white mb-2">Keep Practicing!</h2>
                                <p className="text-slate-300 mb-4">You scored {score}%. Review the lesson and try again.</p>
                            </>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => router.push(`/learning-paths/${curriculumId}/lesson/${lessonId}`)}
                                className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
                            >
                                Back to Lesson
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

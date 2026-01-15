'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import {
    FileCheck,
    Trophy,
    Clock,
    ChevronRight,
    BookOpen,
    Target,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getCurricula } from '@/lib/firestore';

interface Assessment {
    id: string;
    type: 'quiz' | 'exam';
    lessonId: string;
    lessonName: string;
    curriculumId: string;
    curriculumTitle: string;
    estimatedMinutes?: number;
}

export default function AssessmentsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAssessments = async () => {
            if (!user) return;

            try {
                const curricula = await getCurricula(user.uid);
                const allAssessments: Assessment[] = [];

                curricula.forEach((curriculum: any) => {
                    curriculum.modules?.forEach((module: any) => {
                        module.topics?.forEach((topic: any) => {
                            topic.lessons?.forEach((lesson: any) => {
                                // Check for quizzes
                                if (lesson.quizId || lesson.content?.quiz) {
                                    allAssessments.push({
                                        id: lesson.quizId || `quiz-${lesson.id}`,
                                        type: 'quiz',
                                        lessonId: lesson.id,
                                        lessonName: lesson.name,
                                        curriculumId: curriculum.id,
                                        curriculumTitle: curriculum.field,
                                        estimatedMinutes: 5
                                    });
                                }
                                // Check for exams
                                if (lesson.examId || lesson.content?.exam) {
                                    allAssessments.push({
                                        id: lesson.examId || `exam-${lesson.id}`,
                                        type: 'exam',
                                        lessonId: lesson.id,
                                        lessonName: lesson.name,
                                        curriculumId: curriculum.id,
                                        curriculumTitle: curriculum.field,
                                        estimatedMinutes: 15
                                    });
                                }
                            });
                        });
                    });
                });

                setAssessments(allAssessments.slice(0, 20)); // Limit to 20
            } catch (e) {
                console.error('Failed to load assessments', e);
            } finally {
                setLoading(false);
            }
        };

        loadAssessments();
    }, [user]);

    const handleTakeAssessment = (assessment: Assessment) => {
        if (assessment.type === 'quiz') {
            router.push(`/learning-paths/${assessment.curriculumId}/quiz/${assessment.lessonId}`);
        } else {
            router.push(`/learning-paths/${assessment.curriculumId}/exam/${assessment.lessonId}`);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Assessments</h1>
                    <p className="text-slate-400">Test your knowledge with quizzes and exams</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Target className="h-5 w-5 text-blue-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">
                            {assessments.filter(a => a.type === 'quiz').length}
                        </p>
                        <p className="text-slate-500 text-sm">Available Quizzes</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <FileCheck className="h-5 w-5 text-purple-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">
                            {assessments.filter(a => a.type === 'exam').length}
                        </p>
                        <p className="text-slate-500 text-sm">Available Exams</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 col-span-2 md:col-span-1"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <Trophy className="h-5 w-5 text-green-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-green-400">0</p>
                        <p className="text-slate-500 text-sm">Passed</p>
                    </motion.div>
                </div>

                {/* Assessment List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Available Assessments</h2>
                    </div>

                    {assessments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No assessments available yet</p>
                            <p className="text-slate-500 text-sm">Create learning paths to unlock quizzes and exams</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assessments.map((assessment, index) => (
                                <motion.button
                                    key={assessment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.03 }}
                                    onClick={() => handleTakeAssessment(assessment)}
                                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-colors text-left"
                                >
                                    <div className={`p-2 rounded-lg ${assessment.type === 'quiz'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {assessment.type === 'quiz' ? (
                                            <Target className="h-5 w-5" />
                                        ) : (
                                            <FileCheck className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${assessment.type === 'quiz'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {assessment.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium truncate">{assessment.lessonName}</p>
                                        <p className="text-sm text-slate-500 truncate">{assessment.curriculumTitle}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">{assessment.estimatedMinutes}m</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

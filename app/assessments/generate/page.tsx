'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Sparkles,
    Target,
    Loader2,
    Check,
    AlertCircle
} from 'lucide-react';
import { DOMAINS } from '@/lib/domains-config';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export default function GenerateAssessmentPage() {
    const router = useRouter();
    const [topic, setTopic] = useState('');
    const [domain, setDomain] = useState('technology');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [questionCount, setQuestionCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState('');

    const generateAssessment = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/generate-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, domain, difficulty, questionCount })
            });

            if (!response.ok) {
                throw new Error('Failed to generate assessment');
            }

            const data = await response.json();
            setQuestions(data.questions);
            setCurrentQuestion(0);
            setSelectedAnswers({});
            setShowResults(false);
        } catch (e) {
            setError('Failed to generate assessment. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const selectAnswer = (answerIndex: number) => {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: answerIndex }));
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const getScore = () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const resetAssessment = () => {
        setQuestions([]);
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setShowResults(false);
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/assessments')}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Generate Assessment</h1>
                        <p className="text-slate-400">Create a custom quiz on any topic</p>
                    </div>
                </div>

                {questions.length === 0 ? (
                    /* Generator Form */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card space-y-6"
                    >
                        {/* Topic */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., React Hooks, Machine Learning, Python Basics"
                                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Domain */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Domain</label>
                            <select
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                            >
                                {DOMAINS.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Difficulty</label>
                            <div className="flex gap-3">
                                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`flex-1 py-3 rounded-lg border transition-colors capitalize ${difficulty === level
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Number of Questions: {questionCount}
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="15"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>3</span>
                                <span>15</span>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={generateAssessment}
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Generate Assessment
                                </>
                            )}
                        </button>
                    </motion.div>
                ) : showResults ? (
                    /* Results */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card text-center space-y-6"
                    >
                        <div className={`inline-flex p-6 rounded-full ${getScore() / questions.length >= 0.7
                                ? 'bg-green-500/20'
                                : 'bg-orange-500/20'
                            }`}>
                            <Target className={`h-16 w-16 ${getScore() / questions.length >= 0.7
                                    ? 'text-green-400'
                                    : 'text-orange-400'
                                }`} />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {getScore()} / {questions.length}
                            </h2>
                            <p className="text-slate-400">
                                {getScore() / questions.length >= 0.7
                                    ? 'Great job! Keep up the good work!'
                                    : 'Good effort! Review the material and try again.'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={resetAssessment}
                                className="flex-1 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                            >
                                New Assessment
                            </button>
                            <button
                                onClick={() => router.push('/assessments')}
                                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                            >
                                Back to Assessments
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* Quiz */
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card space-y-6"
                    >
                        {/* Progress */}
                        <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>Question {currentQuestion + 1} of {questions.length}</span>
                            <span className="capitalize">{difficulty}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            />
                        </div>

                        {/* Question */}
                        <h2 className="text-xl font-semibold text-white">
                            {questions[currentQuestion].question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {questions[currentQuestion].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectAnswer(idx)}
                                    className={`w-full p-4 rounded-lg border text-left transition-colors ${selectedAnswers[currentQuestion] === idx
                                            ? 'border-blue-500 bg-blue-500/10 text-white'
                                            : 'border-slate-700 text-slate-300 hover:border-slate-600'
                                        }`}
                                >
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs mr-3">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {option}
                                </button>
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-3">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestion === 0}
                                className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextQuestion}
                                disabled={selectedAnswers[currentQuestion] === undefined}
                                className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
                            >
                                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}

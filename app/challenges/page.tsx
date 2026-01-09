'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Code, Trophy, Calendar, Plus, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getChallenges, saveChallenges } from '@/lib/firestore';

interface Challenge {
    id: string;
    title: string;
    platform: 'leetcode' | 'hackerrank' | 'codeforces' | 'custom';
    difficulty: 'easy' | 'medium' | 'hard';
    url?: string;
    description?: string;
    completed: boolean;
    dateAdded: string;
}

export default function ChallengesPage() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        platform: 'custom' as Challenge['platform'],
        difficulty: 'medium' as Challenge['difficulty'],
        url: '',
        description: '',
    });

    useEffect(() => {
        const loadChallenges = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const saved = await getChallenges(user.uid);
                if (saved.length > 0) {
                    setChallenges(saved);
                } else {
                    // Add default challenges
                    const defaults: Challenge[] = [
                        {
                            id: 'lc-today',
                            title: 'Two Sum',
                            platform: 'leetcode',
                            difficulty: 'easy',
                            url: 'https://leetcode.com/problems/two-sum/',
                            description: 'Find two numbers that add up to a target',
                            completed: false,
                            dateAdded: new Date().toISOString(),
                        },
                    ];
                    setChallenges(defaults);
                    await saveChallenges(user.uid, defaults);
                }
            } catch (error) {
                console.error('Failed to load challenges', error);
            } finally {
                setLoading(false);
            }
        };

        loadChallenges();
    }, [user]);

    const updateChallenges = async (updated: Challenge[]) => {
        setChallenges(updated);
        if (user) {
            await saveChallenges(user.uid, updated);
        }
    };

    const toggleComplete = (id: string) => {
        const updated = challenges.map(c =>
            c.id === id ? { ...c, completed: !c.completed } : c
        );
        updateChallenges(updated);
    };

    const addChallenge = () => {
        const challenge: Challenge = {
            id: crypto.randomUUID(),
            ...newChallenge,
            completed: false,
            dateAdded: new Date().toISOString(),
        };
        updateChallenges([...challenges, challenge]);
        setShowAddModal(false);
        setNewChallenge({
            title: '',
            platform: 'custom',
            difficulty: 'medium',
            url: '',
            description: '',
        });
    };

    const platformColors = {
        leetcode: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        hackerrank: 'bg-green-500/10 text-green-400 border-green-500/30',
        codeforces: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        custom: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    };

    const difficultyColors = {
        easy: 'text-green-400',
        medium: 'text-yellow-400',
        hard: 'text-red-400',
    };

    const completedCount = challenges.filter(c => c.completed).length;
    const streak = 0; // Placeholder for streak calculation

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Coding Challenges</h1>
                    <p className="text-slate-400">Practice daily to improve your coding skills</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20"
                    >
                        <Trophy className="h-8 w-8 text-blue-400 mb-3" />
                        <div className="text-3xl font-bold text-white mb-1">{completedCount}</div>
                        <div className="text-sm text-slate-400">Challenges Completed</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20"
                    >
                        <Calendar className="h-8 w-8 text-orange-400 mb-3" />
                        <div className="text-3xl font-bold text-white mb-1">{streak}</div>
                        <div className="text-sm text-slate-400">Day Streak</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20"
                    >
                        <Code className="h-8 w-8 text-green-400 mb-3" />
                        <div className="text-3xl font-bold text-white mb-1">{challenges.length}</div>
                        <div className="text-sm text-slate-400">Total Challenges</div>
                    </motion.div>
                </div>

                {/* Add Button */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Your Challenges</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Add Challenge
                    </button>
                </div>

                {/* Challenges List */}
                <div className="space-y-4">
                    {challenges.map((challenge, idx) => (
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card-hover cursor-pointer"
                            onClick={() => !challenge.completed && toggleComplete(challenge.id)}
                        >
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleComplete(challenge.id);
                                    }}
                                    className="mt-1"
                                >
                                    {challenge.completed ? (
                                        <CheckCircle className="h-6 w-6 text-green-400" />
                                    ) : (
                                        <Circle className="h-6 w-6 text-slate-600 hover:text-blue-400 transition-colors" />
                                    )}
                                </button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className={`text-lg font-semibold ${challenge.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                            {challenge.title}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${platformColors[challenge.platform]}`}>
                                            {challenge.platform}
                                        </span>
                                        <span className={`text-sm font-medium ${difficultyColors[challenge.difficulty]}`}>
                                            {challenge.difficulty}
                                        </span>
                                    </div>
                                    {challenge.description && (
                                        <p className="text-sm text-slate-400 mb-2">{challenge.description}</p>
                                    )}
                                    <div className="text-xs text-slate-500">
                                        Added {new Date(challenge.dateAdded).toLocaleDateString()}
                                    </div>
                                </div>

                                {challenge.url && (
                                    <a
                                        href={challenge.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        <ExternalLink className="h-5 w-5 text-slate-400 hover:text-blue-400" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {challenges.length === 0 && (
                        <div className="card text-center py-12">
                            <Code className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Challenges Yet</h3>
                            <p className="text-slate-400 mb-4">Add your first coding challenge to get started!</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
                            >
                                Add Challenge
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Challenge Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-white mb-4">Add New Challenge</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newChallenge.title}
                                        onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g., Binary Tree Traversal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Platform</label>
                                    <select
                                        value={newChallenge.platform}
                                        onChange={(e) => setNewChallenge({ ...newChallenge, platform: e.target.value as any })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="leetcode">LeetCode</option>
                                        <option value="hackerrank">HackerRank</option>
                                        <option value="codeforces">CodeForces</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                                    <select
                                        value={newChallenge.difficulty}
                                        onChange={(e) => setNewChallenge({ ...newChallenge, difficulty: e.target.value as any })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">URL (optional)</label>
                                    <input
                                        type="url"
                                        value={newChallenge.url}
                                        onChange={(e) => setNewChallenge({ ...newChallenge, url: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="https://leetcode.com/problems/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Description (optional)</label>
                                    <textarea
                                        value={newChallenge.description}
                                        onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 h-24"
                                        placeholder="Brief description of the challenge..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={addChallenge}
                                    disabled={!newChallenge.title}
                                    className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-colors"
                                >
                                    Add Challenge
                                </button>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

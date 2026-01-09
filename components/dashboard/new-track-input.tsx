'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface NewTrackInputProps {
    onGenerate: (field: string) => void;
    selectedDomain?: string;
    onDomainChange?: (domain: string) => void;
}

export function NewTrackInput({ onGenerate, selectedDomain = 'technology', onDomainChange }: NewTrackInputProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        await onGenerate(input);
        setIsLoading(false);
        setInput('');
    };

    return (
        <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Domain Category
                    </label>
                    <select
                        value={selectedDomain}
                        onChange={(e) => onDomainChange?.(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        disabled={isLoading}
                    >
                        {domains.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.emoji} {d.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Learning Topic
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., Machine Learning in Healthcare"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-400 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5" />
                            Generate Learning Path
                        </>
                    )}
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-400">
                The AI will create a comprehensive curriculum with prerequisites, resources, and exams
            </p>
        </div>
    );
}

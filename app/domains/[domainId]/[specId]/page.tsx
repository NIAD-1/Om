'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Target,
    Newspaper,
    TrendingUp,
    ExternalLink,
    Plus,
    Loader2,
    Star,
    Play
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getCurricula, getRoadmaps } from '@/lib/firestore';
import { DOMAINS } from '@/lib/domains-config';
import { FEATURED_CURRICULA } from '@/lib/featured-content';

// Specialization definitions per domain
const SPECIALIZATIONS: Record<string, Record<string, { name: string; description: string; keywords: string[] }>> = {
    'technology': {
        'web-dev': { name: 'Web Development', description: 'Frontend, backend, and full-stack web development', keywords: ['web', 'frontend', 'backend', 'react', 'node', 'html', 'css', 'javascript'] },
        'mobile-dev': { name: 'Mobile Development', description: 'iOS, Android, and cross-platform app development', keywords: ['mobile', 'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin'] },
        'cloud': { name: 'Cloud Computing', description: 'AWS, Azure, GCP and cloud architecture', keywords: ['cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'docker'] },
        'cybersecurity': { name: 'Cybersecurity', description: 'Security, ethical hacking, and penetration testing', keywords: ['security', 'hacking', 'penetration', 'cyber', 'network security'] },
        'databases': { name: 'Databases', description: 'SQL, NoSQL, and database administration', keywords: ['database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql'] },
        'ai': { name: 'AI & Machine Learning', description: 'Artificial intelligence and ML engineering', keywords: ['ai', 'machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch'] },
    },
    'finance': {
        'investing': { name: 'Investing', description: 'Stock market, portfolio management, and long-term investing', keywords: ['investing', 'stocks', 'portfolio', 'dividends', 'value investing'] },
        'trading': { name: 'Trading', description: 'Day trading, technical analysis, and trading strategies', keywords: ['trading', 'day trading', 'technical analysis', 'forex', 'options'] },
        'fintech': { name: 'FinTech', description: 'Financial technology, crypto, and digital payments', keywords: ['fintech', 'crypto', 'blockchain', 'defi', 'digital payments'] },
    },
    'science': {
        'physics': { name: 'Physics', description: 'Classical mechanics to quantum physics', keywords: ['physics', 'quantum', 'mechanics', 'thermodynamics'] },
        'biology': { name: 'Biology', description: 'Life sciences, genetics, and molecular biology', keywords: ['biology', 'genetics', 'molecular', 'cell', 'evolution'] },
        'chemistry': { name: 'Chemistry', description: 'Organic, inorganic, and physical chemistry', keywords: ['chemistry', 'organic', 'inorganic', 'biochemistry'] },
    }
};

// Curated resources for specializations
const SPECIALIZATION_RESOURCES: Record<string, { title: string; url: string; type: string; source: string }[]> = {
    'investing': [
        { title: 'Investopedia - Complete Investing Guide', url: 'https://www.investopedia.com/investing-4427685', type: 'article', source: 'Investopedia' },
        { title: 'Yale: Financial Markets (Full Course)', url: 'https://www.youtube.com/playlist?list=PL8FB14A2200B87185', type: 'video', source: 'Yale University' },
        { title: 'The Intelligent Investor Summary', url: 'https://www.youtube.com/watch?v=npoyc_X5zO8', type: 'video', source: 'Swedish Investor' },
    ],
    'trading': [
        { title: 'Technical Analysis Course', url: 'https://www.investopedia.com/trading/technical-analysis-strategies/', type: 'article', source: 'Investopedia' },
        { title: 'Trading for Beginners (Full Course)', url: 'https://www.youtube.com/watch?v=Xn7KWR9EOGQ', type: 'video', source: 'Trading 212' },
    ],
    'fintech': [
        { title: 'What is FinTech?', url: 'https://www.investopedia.com/terms/f/fintech.asp', type: 'article', source: 'Investopedia' },
        { title: 'Blockchain & Crypto Fundamentals', url: 'https://www.youtube.com/watch?v=SSo_EIwHSd4', type: 'video', source: '3Blue1Brown' },
    ],
    'web-dev': [
        { title: 'freeCodeCamp Web Development', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'course', source: 'freeCodeCamp' },
        { title: 'The Odin Project', url: 'https://www.theodinproject.com/', type: 'course', source: 'The Odin Project' },
        { title: 'Full Stack Open', url: 'https://fullstackopen.com/', type: 'course', source: 'University of Helsinki' },
    ],
    'ai': [
        { title: 'Andrew Ng ML Course', url: 'https://www.youtube.com/playlist?list=PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI', type: 'video', source: 'DeepLearning.AI' },
        { title: 'fast.ai Practical Deep Learning', url: 'https://course.fast.ai/', type: 'course', source: 'fast.ai' },
    ],
};

export default function SpecializationPage() {
    const router = useRouter();
    const params = useParams();
    const domainId = params.domainId as string;
    const specId = params.specId as string;
    const { user } = useAuth();

    const [curricula, setCurricula] = useState<any[]>([]);
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const domain = DOMAINS.find(d => d.id === domainId);
    const specialization = SPECIALIZATIONS[domainId]?.[specId];
    const resources = SPECIALIZATION_RESOURCES[specId] || [];

    // Find featured curricula matching this specialization
    const featuredForSpec = FEATURED_CURRICULA.filter(c =>
        c.domain === domainId &&
        specialization?.keywords.some(kw => c.field.toLowerCase().includes(kw))
    );

    useEffect(() => {
        const loadContent = async () => {
            if (!user || !specialization) return;

            try {
                const [allCurricula, allRoadmaps] = await Promise.all([
                    getCurricula(user.uid),
                    getRoadmaps(user.uid)
                ]);

                // Filter by keywords
                const matchesCurriculum = (c: any) =>
                    specialization.keywords.some(kw =>
                        c.field?.toLowerCase().includes(kw) ||
                        c.description?.toLowerCase().includes(kw)
                    );

                const matchesRoadmap = (r: any) =>
                    specialization.keywords.some(kw =>
                        r.title?.toLowerCase().includes(kw) ||
                        r.description?.toLowerCase().includes(kw)
                    );

                setCurricula(allCurricula.filter(matchesCurriculum));
                setRoadmaps(allRoadmaps.filter(matchesRoadmap));
            } catch (e) {
                console.error('Failed to load content', e);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [user, domainId, specId, specialization]);

    if (!domain || !specialization) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-slate-400">Specialization not found</p>
                    <button onClick={() => router.back()} className="mt-4 text-blue-400 hover:text-blue-300">
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.push(`/domains/${domainId}`)}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mt-1"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <span>{domain.name}</span>
                            <span>/</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{specialization.name}</h1>
                        <p className="text-slate-400">{specialization.description}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Generate Path
                    </button>
                </div>

                {/* Curated Resources */}
                {resources.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="h-5 w-5 text-yellow-400" />
                            <h2 className="text-xl font-semibold text-white">Curated Resources</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resources.map((resource, idx) => (
                                <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-yellow-500/20">
                                            {resource.type === 'video' ? (
                                                <Play className="h-4 w-4 text-yellow-400" />
                                            ) : (
                                                <BookOpen className="h-4 w-4 text-yellow-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                                                {resource.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">{resource.source}</p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-yellow-400" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Featured Learning Paths */}
                {featuredForSpec.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Featured Learning Paths</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {featuredForSpec.map((curriculum) => (
                                <button
                                    key={curriculum.id}
                                    onClick={() => router.push(`/learning-paths/featured/${curriculum.id}`)}
                                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 text-left transition-all"
                                >
                                    <h3 className="font-semibold text-white">{curriculum.field}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{curriculum.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                        <span>{curriculum.estimatedHours}h</span>
                                        <span className="capitalize">{curriculum.difficulty}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* User's Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Roadmaps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="h-5 w-5 text-purple-400" />
                            <h2 className="text-lg font-semibold text-white">Your Roadmaps</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        ) : roadmaps.length === 0 ? (
                            <div className="text-center py-8">
                                <Target className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-400">No roadmaps in {specialization.name} yet</p>
                                <button
                                    onClick={() => router.push('/roadmaps/create')}
                                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Create one
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {roadmaps.map((rm) => (
                                    <button
                                        key={rm.id}
                                        onClick={() => router.push(`/roadmaps/${rm.id}`)}
                                        className="w-full p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-left"
                                    >
                                        <span className="text-white">{rm.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Learning Paths */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Your Learning Paths</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        ) : curricula.length === 0 ? (
                            <div className="text-center py-8">
                                <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-400">No learning paths in {specialization.name} yet</p>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Generate one
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {curricula.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => router.push(`/learning-paths/${c.id}`)}
                                        className="w-full p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-left"
                                    >
                                        <span className="text-white">{c.field}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}

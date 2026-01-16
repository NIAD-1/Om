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
    Code,
    Brain,
    Cpu,
    Cloud,
    Shield,
    Database,
    Loader2,
    FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getCurricula, getRoadmaps } from '@/lib/firestore';
import { DOMAINS } from '@/lib/domains-config';
import { getFeaturedByDomain, FeaturedCurriculum, FeaturedRoadmap } from '@/lib/featured-content';
import { DocumentReader, useDocumentReader } from '@/components/reader/document-reader';
import { Star, Play } from 'lucide-react';

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
}

interface ResearchPaper {
    title: string;
    authors: string[];
    summary: string;
    url: string;
    source: string;
}

const SUB_FIELDS: Record<string, Array<{ id: string; name: string; icon: any }>> = {
    'technology': [
        { id: 'web-dev', name: 'Web Development', icon: Code },
        { id: 'mobile-dev', name: 'Mobile Apps', icon: Code },
        { id: 'cloud', name: 'Cloud Computing', icon: Cloud },
        { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield },
        { id: 'databases', name: 'Databases', icon: Database },
        { id: 'iot', name: 'IoT & Embedded', icon: Cpu },
        { id: 'ai', name: 'AI & ML', icon: Brain },
    ],
    'finance': [
        { id: 'investing', name: 'Investing', icon: TrendingUp },
        { id: 'trading', name: 'Trading', icon: TrendingUp },
        { id: 'fintech', name: 'FinTech', icon: Code },
    ],
    'science': [
        { id: 'physics', name: 'Physics', icon: Brain },
        { id: 'biology', name: 'Biology', icon: Brain },
        { id: 'chemistry', name: 'Chemistry', icon: Brain },
    ],
};

export default function DomainPage() {
    const router = useRouter();
    const params = useParams();
    const domainId = params.domainId as string;
    const { user } = useAuth();
    const { readerState, openReader, closeReader } = useDocumentReader();

    const [curricula, setCurricula] = useState<any[]>([]);
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [papers, setPapers] = useState<ResearchPaper[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingNews, setLoadingNews] = useState(true);

    // Featured content
    const [featured, setFeatured] = useState<{ curricula: FeaturedCurriculum[], roadmaps: FeaturedRoadmap[] }>({ curricula: [], roadmaps: [] });

    const domain = DOMAINS.find(d => d.id === domainId);
    const subFields = SUB_FIELDS[domainId] || [];

    // Load featured content on mount
    useEffect(() => {
        setFeatured(getFeaturedByDomain(domainId));
    }, [domainId]);

    useEffect(() => {
        const loadContent = async () => {
            if (!user) return;

            try {
                const [allCurricula, allRoadmaps] = await Promise.all([
                    getCurricula(user.uid),
                    getRoadmaps(user.uid)
                ]);

                // Filter by domain
                const domainCurricula = allCurricula.filter((c: any) =>
                    c.domain === domainId || (domainId === 'technology' && !c.domain)
                );
                const domainRoadmaps = allRoadmaps.filter((r: any) =>
                    r.domain === domainId
                );

                setCurricula(domainCurricula);
                setRoadmaps(domainRoadmaps);
            } catch (e) {
                console.error('Failed to load content', e);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [user, domainId]);

    // Fetch news from API
    useEffect(() => {
        const fetchNews = async () => {
            setLoadingNews(true);
            try {
                const response = await fetch(`/api/domain-news?domain=${domainId}`);
                if (response.ok) {
                    const data = await response.json();
                    setNews(data.articles || []);
                }
            } catch (e) {
                console.error('Failed to fetch news', e);
            } finally {
                setLoadingNews(false);
            }
        };

        fetchNews();
    }, [domainId]);

    if (!domain) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-slate-400">Domain not found</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-2">{domain.name}</h1>
                        <p className="text-slate-400">
                            Explore learning paths, roadmaps, and the latest news
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/roadmaps/create')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Create Roadmap
                    </button>
                </div>

                {/* Sub-fields */}
                {subFields.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Specializations</h2>
                        <div className="flex flex-wrap gap-3">
                            {subFields.map((field) => {
                                const Icon = field.icon;
                                return (
                                    <button
                                        key={field.id}
                                        onClick={() => router.push(`/domains/${domainId}/${field.id}`)}
                                        className="px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white transition-colors flex items-center gap-2"
                                    >
                                        <Icon className="h-4 w-4 text-blue-400" />
                                        {field.name}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Featured Curricula */}
                {featured.curricula.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="h-5 w-5 text-yellow-400" />
                            <h2 className="text-xl font-semibold text-white">Featured Learning Paths</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {featured.curricula.map((curriculum) => (
                                <button
                                    key={curriculum.id}
                                    onClick={() => router.push(`/learning-paths/featured/${curriculum.id}`)}
                                    className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 text-left transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                                            {curriculum.field}
                                        </h3>
                                        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs capitalize">
                                            {curriculum.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-2">{curriculum.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span>{curriculum.estimatedHours}h</span>
                                        <span>•</span>
                                        <span>{curriculum.modules.length} modules</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Roadmaps */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-purple-400" />
                                    <h2 className="text-xl font-semibold text-white">Roadmaps</h2>
                                </div>
                                <button
                                    onClick={() => router.push('/roadmaps')}
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    View All
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                </div>
                            ) : roadmaps.length === 0 ? (
                                <div className="text-center py-8">
                                    <Target className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-400">No roadmaps in this domain yet</p>
                                    <button
                                        onClick={() => router.push('/roadmaps/create')}
                                        className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        Create your first roadmap
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {roadmaps.slice(0, 3).map((roadmap) => (
                                        <button
                                            key={roadmap.id}
                                            onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
                                            className="w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-left transition-colors"
                                        >
                                            <h3 className="font-medium text-white">{roadmap.title}</h3>
                                            <p className="text-sm text-slate-400 line-clamp-1">{roadmap.description}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Learning Paths */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-400" />
                                    <h2 className="text-xl font-semibold text-white">Learning Paths</h2>
                                </div>
                                <button
                                    onClick={() => router.push('/learning-paths')}
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    View All
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                </div>
                            ) : curricula.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-400">No learning paths in this domain yet</p>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        Generate a learning path
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {curricula.slice(0, 5).map((curriculum) => (
                                        <button
                                            key={curriculum.id}
                                            onClick={() => router.push(`/learning-paths/${curriculum.id}`)}
                                            className="w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-left transition-colors"
                                        >
                                            <h3 className="font-medium text-white">{curriculum.field}</h3>
                                            <p className="text-sm text-slate-400">
                                                {curriculum.modules?.length || 0} modules
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar (1 col) */}
                    <div className="space-y-6">
                        {/* News Feed */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="card"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Newspaper className="h-5 w-5 text-orange-400" />
                                <h2 className="text-lg font-semibold text-white">Latest News</h2>
                            </div>

                            {loadingNews ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {news.map((article, idx) => (
                                        <a
                                            key={idx}
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors"
                                        >
                                            <h4 className="text-sm font-medium text-white line-clamp-2">{article.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{article.source}</p>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Research Papers */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="card"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-green-400" />
                                <h2 className="text-lg font-semibold text-white">Research</h2>
                            </div>

                            <div className="text-center py-4">
                                <p className="text-sm text-slate-400">
                                    Research papers coming soon
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    via arXiv, Semantic Scholar
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Document Reader Modal */}
            {readerState.isOpen && (
                <DocumentReader
                    url={readerState.url}
                    title={readerState.title}
                    type={readerState.type}
                    onClose={closeReader}
                />
            )}
        </DashboardLayout>
    );
}

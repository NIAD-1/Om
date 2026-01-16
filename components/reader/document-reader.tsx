'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, FileText, Maximize2, Minimize2 } from 'lucide-react';

interface DocumentReaderProps {
    url: string;
    title: string;
    type: 'pdf' | 'article' | 'video';
    onClose: () => void;
}

export function DocumentReader({ url, title, type, onClose }: DocumentReaderProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Check if URL is embeddable
    const getEmbedUrl = (originalUrl: string): string | null => {
        // arXiv PDF
        if (originalUrl.includes('arxiv.org/abs/')) {
            return originalUrl.replace('/abs/', '/pdf/') + '.pdf';
        }
        if (originalUrl.includes('arxiv.org/pdf/')) {
            return originalUrl;
        }
        // Google Docs/Sheets/Slides
        if (originalUrl.includes('docs.google.com')) {
            return originalUrl.replace('/edit', '/preview');
        }
        // YouTube - convert to embed
        if (originalUrl.includes('youtube.com/watch')) {
            const videoId = new URL(originalUrl).searchParams.get('v');
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (originalUrl.includes('youtu.be/')) {
            const videoId = originalUrl.split('youtu.be/')[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // For other URLs, try iframe
        return originalUrl;
    };

    // Check if URL can be embedded
    const canEmbed = (url: string): boolean => {
        return (
            url.includes('arxiv.org') ||
            url.includes('youtube.com') ||
            url.includes('youtu.be') ||
            url.includes('docs.google.com') ||
            url.includes('github.com') ||
            url.includes('wikipedia.org') ||
            type === 'pdf'
        );
    };

    const embedUrl = getEmbedUrl(url);
    const isEmbeddable = canEmbed(url);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 ${isFullscreen ? '' : 'bg-black/50'}`}
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`absolute bg-slate-900 border-l border-slate-700 flex flex-col ${isFullscreen ? 'inset-0' : 'top-0 right-0 w-full md:w-3/4 lg:w-2/3 h-full'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                            <h3 className="font-medium text-white truncate">{title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                title="Open in new tab"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {isEmbeddable && !loadError ? (
                            <iframe
                                src={embedUrl || ''}
                                className="w-full h-full border-0"
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onError={() => setLoadError(true)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <FileText className="h-16 w-16 text-slate-600 mb-4" />
                                <h4 className="text-xl font-medium text-white mb-2">External Content</h4>
                                <p className="text-slate-400 mb-6 max-w-md">
                                    This content cannot be embedded directly. Click below to view it in a new tab.
                                </p>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                    Open {type === 'pdf' ? 'PDF' : 'Page'}
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook for managing document reader state
export function useDocumentReader() {
    const [readerState, setReaderState] = useState<{
        isOpen: boolean;
        url: string;
        title: string;
        type: 'pdf' | 'article' | 'video';
    }>({
        isOpen: false,
        url: '',
        title: '',
        type: 'article'
    });

    const openReader = (url: string, title: string, type: 'pdf' | 'article' | 'video' = 'article') => {
        setReaderState({ isOpen: true, url, title, type });
    };

    const closeReader = () => {
        setReaderState(prev => ({ ...prev, isOpen: false }));
    };

    return { readerState, openReader, closeReader };
}

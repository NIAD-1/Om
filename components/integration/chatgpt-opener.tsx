'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';

interface ChatGPTOpenerProps {
    prompt: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatGPTOpener({ prompt, isOpen, onClose }: ChatGPTOpenerProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    };

    const openChatGPT = () => {
        // Copy prompt first
        navigator.clipboard.writeText(prompt);
        // Open ChatGPT in new tab
        window.open('https://chat.openai.com', '_blank');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <Sparkles className="h-5 w-5 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Use with ChatGPT</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3 text-sm text-slate-400">
                        <p>Click the button below to:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Copy the prompt to your clipboard</li>
                            <li>Open ChatGPT in a new tab</li>
                            <li>Paste the prompt (Ctrl/Cmd + V)</li>
                            <li>Add your topic and get your roadmap!</li>
                        </ol>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 max-h-32 overflow-y-auto">
                        <pre className="text-xs text-slate-400 whitespace-pre-wrap">
                            {prompt.slice(0, 300)}...
                        </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="flex-1 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-5 w-5 text-green-400" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-5 w-5" />
                                    Copy Prompt
                                </>
                            )}
                        </button>
                        <button
                            onClick={openChatGPT}
                            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-all"
                        >
                            <ExternalLink className="h-5 w-5" />
                            Open ChatGPT
                        </button>
                    </div>

                    <p className="text-xs text-center text-slate-500">
                        The prompt will be copied automatically when you click "Open ChatGPT"
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook for managing ChatGPT opener state
export function useChatGPTOpener() {
    const [state, setState] = useState<{
        isOpen: boolean;
        prompt: string;
    }>({
        isOpen: false,
        prompt: ''
    });

    const openWithPrompt = (prompt: string) => {
        setState({ isOpen: true, prompt });
    };

    const close = () => {
        setState(prev => ({ ...prev, isOpen: false }));
    };

    return { state, openWithPrompt, close };
}

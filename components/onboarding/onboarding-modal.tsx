'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    MousePointer2
} from 'lucide-react';

interface TourStep {
    page: string;
    elementId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
    // Dashboard steps
    {
        page: '/dashboard',
        elementId: 'dashboard-welcome',
        title: 'Welcome!',
        description: 'This is your learning dashboard. Here you can see your progress and create new learning paths.',
        position: 'bottom'
    },
    {
        page: '/dashboard',
        elementId: 'progress-overview',
        title: 'Your Progress',
        description: 'Track your learning streak, lessons completed this week, and topics mastered.',
        position: 'bottom'
    },
    {
        page: '/dashboard',
        elementId: 'new-track-input',
        title: 'Create Learning Path',
        description: 'Type any topic here and click Generate to create an AI-powered curriculum instantly!',
        position: 'top'
    },
    {
        page: '/dashboard',
        elementId: 'domain-grid',
        title: 'Knowledge Domains',
        description: 'Browse by category to see your learning paths organized by topic.',
        position: 'top'
    },
    // Learning Paths page
    {
        page: '/learning-paths',
        elementId: 'learning-paths-header',
        title: 'Your Learning Paths',
        description: 'All your generated curricula appear here. Click any card to start learning!',
        position: 'bottom'
    },
    // Roadmaps page
    {
        page: '/roadmaps',
        elementId: 'roadmaps-header',
        title: 'Career Roadmaps',
        description: 'Roadmaps combine multiple learning paths into a complete career journey.',
        position: 'bottom'
    },
    {
        page: '/roadmaps/create',
        elementId: 'create-roadmap-options',
        title: 'Three Ways to Create',
        description: 'Generate with AI, import from YouTube, or create manually with ChatGPT help.',
        position: 'bottom'
    },
    // Manual creation
    {
        page: '/roadmaps/create/manual',
        elementId: 'chatgpt-prompt-section',
        title: 'AI Prompt Template',
        description: 'Copy this prompt, paste in ChatGPT or Gemini with your topic, paste the result below!',
        position: 'bottom'
    }
];

interface InteractiveTourProps {
    isActive: boolean;
    onComplete: () => void;
}

export function InteractiveTour({ isActive, onComplete }: InteractiveTourProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = tourSteps[currentStepIndex];
    const stepsOnCurrentPage = tourSteps.filter(s => s.page === pathname);
    const currentPageStepIndex = stepsOnCurrentPage.findIndex(s => s === currentStep);

    // Find and highlight target element
    const updateTarget = useCallback(() => {
        if (!currentStep || pathname !== currentStep.page) return;

        const element = document.getElementById(currentStep.elementId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setTargetRect(null);
        }
    }, [currentStep, pathname]);

    useEffect(() => {
        if (!isActive) return;

        // Navigate to the step's page if needed
        if (currentStep && pathname !== currentStep.page) {
            router.push(currentStep.page);
        }

        // Update target after navigation
        const timer = setTimeout(updateTarget, 500);
        return () => clearTimeout(timer);
    }, [currentStep, pathname, isActive, router, updateTarget]);

    useEffect(() => {
        if (!isActive) return;
        window.addEventListener('resize', updateTarget);
        return () => window.removeEventListener('resize', updateTarget);
    }, [isActive, updateTarget]);

    const nextStep = () => {
        if (currentStepIndex < tourSteps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    if (!isActive || !currentStep) return null;

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const padding = 16;
        switch (currentStep.position) {
            case 'top':
                return {
                    bottom: window.innerHeight - targetRect.top + padding,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translateX(-50%)'
                };
            case 'bottom':
                return {
                    top: targetRect.bottom + padding,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translateX(-50%)'
                };
            case 'left':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    right: window.innerWidth - targetRect.left + padding,
                    transform: 'translateY(-50%)'
                };
            case 'right':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.right + padding,
                    transform: 'translateY(-50%)'
                };
            default:
                return {};
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* Overlay with hole for highlighted element */}
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        <mask id="tour-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect
                                    x={targetRect.left - 8}
                                    y={targetRect.top - 8}
                                    width={targetRect.width + 16}
                                    height={targetRect.height + 16}
                                    rx="12"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0,0,0,0.7)"
                        mask="url(#tour-mask)"
                        className="pointer-events-auto"
                        onClick={onComplete}
                    />
                </svg>

                {/* Highlight border */}
                {targetRect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute border-2 border-blue-400 rounded-xl shadow-lg shadow-blue-500/30"
                        style={{
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16
                        }}
                    />
                )}

                {/* Tooltip */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute w-80 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl pointer-events-auto"
                    style={getTooltipStyle()}
                >
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MousePointer2 className="h-4 w-4 text-blue-400" />
                            <h3 className="font-semibold text-white">{currentStep.title}</h3>
                        </div>
                        <p className="text-slate-300 text-sm">{currentStep.description}</p>
                    </div>

                    <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between rounded-b-2xl">
                        <span className="text-slate-500 text-xs">
                            Step {currentStepIndex + 1} of {tourSteps.length}
                        </span>
                        <div className="flex gap-2">
                            {currentStepIndex > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center gap-1"
                            >
                                {currentStepIndex === tourSteps.length - 1 ? 'Done!' : 'Next'}
                                <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Simple export for backward compatibility
export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return <InteractiveTour isActive={isOpen} onComplete={onClose} />;
}

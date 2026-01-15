'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    X,
    ChevronRight,
    ArrowRight,
    BookOpen,
    Target,
    Brain,
    Sparkles,
    MousePointer,
    Play
} from 'lucide-react';

interface GuidedTourProps {
    isOpen: boolean;
    onClose: () => void;
}

const tourSteps = [
    {
        id: 'welcome',
        title: 'Welcome to Mastery Engine!',
        description: 'Your personal AI-powered learning companion. Let me show you around!',
        icon: Brain,
        color: 'from-blue-500 to-purple-500',
        action: null,
        buttonText: 'Start Tour'
    },
    {
        id: 'dashboard-input',
        title: 'Create Your First Learning Path',
        description: 'Type any topic you want to learn in the input box below, then click Generate.',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        highlight: 'new-track-input',
        action: null,
        buttonText: 'I See It!'
    },
    {
        id: 'roadmaps',
        title: 'Create Career Roadmaps',
        description: 'Go to Roadmaps in the sidebar to create multi-path learning journeys.',
        icon: Target,
        color: 'from-green-500 to-emerald-500',
        action: '/roadmaps/create',
        buttonText: 'Take Me There'
    },
    {
        id: 'manual-create',
        title: 'Use AI to Create Content',
        description: 'In Manual mode, you can paste curriculum JSON from ChatGPT or Gemini. The prompt template is right there!',
        icon: BookOpen,
        color: 'from-orange-500 to-red-500',
        action: '/roadmaps/create/manual',
        buttonText: 'Show Me'
    },
    {
        id: 'done',
        title: 'You Are Ready!',
        description: 'Start learning! Your progress saves automatically. Click the ? icon anytime to see this tour again.',
        icon: Play,
        color: 'from-cyan-500 to-blue-500',
        action: null,
        buttonText: 'Start Learning'
    }
];

export function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const step = tourSteps[currentStep];
    const IconComponent = step.icon;

    const handleNext = () => {
        if (step.action) {
            router.push(step.action);
            // Small delay before advancing
            setTimeout(() => {
                if (currentStep < tourSteps.length - 1) {
                    setCurrentStep(prev => prev + 1);
                } else {
                    onClose();
                }
            }, 500);
        } else {
            if (currentStep < tourSteps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                onClose();
            }
        }
    };

    const handleSkip = () => {
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none"
            >
                {/* Backdrop with hole for highlight */}
                <div className="fixed inset-0 bg-black/60 pointer-events-auto" onClick={handleSkip} />

                {/* Tour Card */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden pointer-events-auto z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-800">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${step.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Icon */}
                        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${step.color} mb-4`}>
                            <IconComponent className="h-8 w-8 text-white" />
                        </div>

                        {/* Text */}
                        <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">{step.description}</p>

                        {/* Pointer Animation */}
                        {step.highlight && (
                            <motion.div
                                className="flex items-center gap-2 mt-4 text-blue-400"
                                animate={{ x: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <MousePointer className="h-5 w-5" />
                                <span className="text-sm">Look below for the input</span>
                            </motion.div>
                        )}

                        {step.action && (
                            <motion.div
                                className="flex items-center gap-2 mt-4 text-green-400"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <ArrowRight className="h-5 w-5" />
                                <span className="text-sm">I will take you there</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
                        <button
                            onClick={handleSkip}
                            className="text-slate-400 hover:text-white text-sm transition-colors"
                        >
                            Skip Tour
                        </button>

                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-sm">
                                {currentStep + 1} / {tourSteps.length}
                            </span>
                            <button
                                onClick={handleNext}
                                className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${step.color} text-white font-medium transition-transform hover:scale-105 flex items-center gap-2`}
                            >
                                {step.buttonText}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Keep the old modal for backward compatibility but export the new tour as default
export { GuidedTour as OnboardingModal };

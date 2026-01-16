'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    ChevronRight,
    Sparkles,
    Code,
    Brain,
    TrendingUp,
    Palette,
    Microscope,
    Building,
    Music,
    Heart,
    Globe,
    Cpu,
    Database,
    Smartphone,
    Cloud,
    Shield,
    LineChart,
    Plus,
    X
} from 'lucide-react';

interface InterestsSelectorProps {
    onComplete: (interests: UserInterests) => void;
}

interface UserInterests {
    domains: string[];
    subFields: string[];
    customFields: string[];
}

const DOMAINS = [
    { id: 'technology', name: 'Technology', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'finance', name: 'Finance & Business', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { id: 'design', name: 'Design & Creative', icon: Palette, color: 'from-orange-500 to-red-500' },
    { id: 'science', name: 'Science & Research', icon: Microscope, color: 'from-cyan-500 to-blue-500' },
    { id: 'engineering', name: 'Engineering', icon: Building, color: 'from-yellow-500 to-orange-500' },
    { id: 'arts', name: 'Arts & Music', icon: Music, color: 'from-pink-500 to-purple-500' },
    { id: 'health', name: 'Health & Medicine', icon: Heart, color: 'from-red-500 to-pink-500' },
    { id: 'languages', name: 'Languages', icon: Globe, color: 'from-teal-500 to-green-500' },
];

const SUB_FIELDS: Record<string, Array<{ id: string; name: string; icon: any }>> = {
    'technology': [
        { id: 'web-dev', name: 'Web Development', icon: Code },
        { id: 'mobile-dev', name: 'Mobile Development', icon: Smartphone },
        { id: 'cloud', name: 'Cloud Computing', icon: Cloud },
        { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield },
        { id: 'databases', name: 'Databases', icon: Database },
        { id: 'iot', name: 'IoT & Embedded', icon: Cpu },
    ],
    'ai-ml': [
        { id: 'deep-learning', name: 'Deep Learning', icon: Brain },
        { id: 'nlp', name: 'Natural Language Processing', icon: Globe },
        { id: 'computer-vision', name: 'Computer Vision', icon: Microscope },
        { id: 'data-science', name: 'Data Science', icon: LineChart },
    ],
    'finance': [
        { id: 'investing', name: 'Investing', icon: TrendingUp },
        { id: 'crypto', name: 'Cryptocurrency', icon: Database },
        { id: 'accounting', name: 'Accounting', icon: LineChart },
    ],
};

export function InterestsSelector({ onComplete }: InterestsSelectorProps) {
    const [step, setStep] = useState(1);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [selectedSubFields, setSelectedSubFields] = useState<string[]>([]);
    const [customFields, setCustomFields] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');

    const toggleDomain = (id: string) => {
        setSelectedDomains(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const toggleSubField = (id: string) => {
        setSelectedSubFields(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const addCustomField = () => {
        if (customInput.trim() && !customFields.includes(customInput.trim())) {
            setCustomFields(prev => [...prev, customInput.trim()]);
            setCustomInput('');
        }
    };

    const removeCustomField = (field: string) => {
        setCustomFields(prev => prev.filter(f => f !== field));
    };

    const handleComplete = () => {
        onComplete({
            domains: selectedDomains,
            subFields: selectedSubFields,
            customFields
        });
    };

    const availableSubFields = selectedDomains.flatMap(d => SUB_FIELDS[d] || []);

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {step === 1 ? "What do you want to learn?" : "Pick your specializations"}
                        </h1>
                    </div>
                    <p className="text-slate-400">
                        {step === 1
                            ? "Select the areas you're interested in. We'll personalize your experience."
                            : "Choose specific topics or add your own interests."
                        }
                    </p>

                    {/* Progress */}
                    <div className="flex gap-2 mt-4">
                        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            >
                                {DOMAINS.map((domain) => {
                                    const Icon = domain.icon;
                                    const isSelected = selectedDomains.includes(domain.id);
                                    return (
                                        <motion.button
                                            key={domain.id}
                                            onClick={() => toggleDomain(domain.id)}
                                            className={`relative p-4 rounded-2xl border-2 transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : 'border-slate-700 hover:border-slate-600 bg-slate-900'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                                                >
                                                    <Check className="h-4 w-4 text-white" />
                                                </motion.div>
                                            )}
                                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${domain.color} mb-3`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <p className="font-medium text-white text-left">{domain.name}</p>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Sub-fields */}
                                {availableSubFields.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">Specializations</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSubFields.map((field) => {
                                                const isSelected = selectedSubFields.includes(field.id);
                                                return (
                                                    <button
                                                        key={field.id}
                                                        onClick={() => toggleSubField(field.id)}
                                                        className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${isSelected
                                                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                                                : 'border-slate-700 hover:border-slate-600 text-slate-300'
                                                            }`}
                                                    >
                                                        {isSelected && <Check className="h-4 w-4" />}
                                                        {field.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Custom fields */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Add your own</h3>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
                                            placeholder="e.g., Quantum Computing, Game Dev..."
                                            className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={addCustomField}
                                            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {customFields.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {customFields.map((field) => (
                                                <span
                                                    key={field}
                                                    className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-2"
                                                >
                                                    {field}
                                                    <button onClick={() => removeCustomField(field)}>
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800">
                <div className="max-w-2xl mx-auto flex justify-between">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-3 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        onClick={() => step === 1 ? setStep(2) : handleComplete()}
                        disabled={step === 1 && selectedDomains.length === 0}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {step === 1 ? 'Continue' : 'Start Learning'}
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

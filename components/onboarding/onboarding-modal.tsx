'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ChevronLeft,
    BookOpen,
    Target,
    Brain,
    Trophy,
    BarChart3,
    MessageSquare,
    Copy,
    Check,
    Sparkles
} from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const slides = [
    {
        id: 'welcome',
        title: 'Welcome to Mastery Engine! 🚀',
        subtitle: 'Your AI-Powered Learning Companion',
        content: `Mastery Engine is a self-learning map that connects you with the best resources available. 

**What you'll get:**
• AI-generated learning paths with curated resources
• Progress tracking across all your courses
• Quizzes and exams to test your knowledge
• An AI tutor to help when you're stuck`,
        icon: Brain,
        color: 'from-blue-500 to-purple-500'
    },
    {
        id: 'learning-paths',
        title: 'Learning Paths 📚',
        subtitle: 'AI-Generated Curriculum',
        content: `**How to create a Learning Path:**

1. Go to **Dashboard** and type any topic
2. Select a domain category
3. Click "Generate Learning Path"
4. The AI will create a structured curriculum with:
   - Modules and topics
   - Video lessons from YouTube
   - Articles and documentation
   - Practice exercises`,
        icon: BookOpen,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'roadmaps',
        title: 'Career Roadmaps 🗺️',
        subtitle: 'Multi-Path Learning Journeys',
        content: `**Roadmaps combine multiple learning paths into a career journey.**

**3 Ways to Create Roadmaps:**

1. **AI Generated** - Describe your career goal
2. **YouTube Playlist** - Import from a video series
3. **Manual JSON** - Full control with custom structure

Each roadmap shows your progress and unlocks paths sequentially.`,
        icon: Target,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'chatgpt',
        title: 'ChatGPT/Gemini Integration 🤖',
        subtitle: 'Create University-Grade Content',
        content: `**Pro Tip: Use AI to create detailed curricula!**

**The Workflow:**
1. Go to Roadmaps → Create → Manual
2. Copy this prompt to ChatGPT/Gemini:

*"Create a detailed learning curriculum for [TOPIC] in JSON format with modules, topics, and lessons. Each lesson should have: id, name, estimatedMinutes, prerequisites array, and content with summary and resources (YouTube videos, articles)."*

3. Paste the JSON response into our editor
4. Add timestamps for video chapters!`,
        icon: MessageSquare,
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 'progress',
        title: 'Progress Tracking 📊',
        subtitle: 'Watch Your Learning Journey',
        content: `**Your learning is automatically tracked:**

• **Video Progress** - Saves where you stopped
• **Activity Log** - "10min watching Variables in Python"
• **Streak Counter** - Daily learning motivation
• **Weekly Stats** - See your total learning time

Resume any video exactly where you left off!`,
        icon: BarChart3,
        color: 'from-cyan-500 to-blue-500'
    },
    {
        id: 'quizzes',
        title: 'Quizzes & Exams 🏆',
        subtitle: 'Test Your Knowledge',
        content: `**Each lesson can have:**

• **Quick Quizzes** - Test understanding after lessons
• **Module Exams** - Comprehensive assessments
• **Pass Requirements** - Unlock next content

**AI Tutor** - Click the chat icon on any lesson to get personalized help explaining concepts.`,
        icon: Trophy,
        color: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'ready',
        title: "You're Ready! 🎉",
        subtitle: 'Start Your Learning Journey',
        content: `**Quick Start Recommendations:**

1. **Generate your first Learning Path** from the Dashboard
2. **Try the Visual Map** to see lesson dependencies
3. **Watch a video** and see your progress save automatically
4. **Create a Roadmap** for your career goals

**Need help?** Use the AI Tutor on any lesson!`,
        icon: Sparkles,
        color: 'from-pink-500 to-purple-500'
    }
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [copied, setCopied] = useState(false);

    const slide = slides[currentSlide];
    const IconComponent = slide.icon;

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const copyPrompt = () => {
        const prompt = `Create a detailed learning curriculum for [YOUR TOPIC HERE] in JSON format. 

The structure should be:
{
  "modules": [
    {
      "id": "unique-id",
      "name": "Module Name",
      "topics": [
        {
          "id": "topic-id",
          "name": "Topic Name",
          "lessons": [
            {
              "id": "lesson-id",
              "name": "Lesson Title",
              "estimatedMinutes": 30,
              "prerequisites": [],
              "content": {
                "summary": "Detailed explanation with **markdown** formatting",
                "resources": [
                  {
                    "type": "video",
                    "title": "Video Title",
                    "url": "https://youtube.com/watch?v=...",
                    "duration": "15 min"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}

Make it comprehensive with real YouTube video URLs, articles, and documentation. Include timestamps for video chapters if available.`;

        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${slide.color} p-6`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <IconComponent className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{slide.title}</h2>
                                    <p className="text-white/80 text-sm">{slide.subtitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="prose prose-invert max-w-none">
                            {slide.content.split('\n').map((line, i) => {
                                if (line.startsWith('**') && line.endsWith('**')) {
                                    return <h3 key={i} className="text-lg font-semibold text-white mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                                }
                                if (line.startsWith('•')) {
                                    return <p key={i} className="text-slate-300 ml-4">{line}</p>;
                                }
                                if (line.match(/^\d\./)) {
                                    return <p key={i} className="text-slate-300 ml-4">{line}</p>;
                                }
                                if (line.startsWith('*') && line.endsWith('*')) {
                                    return <p key={i} className="text-slate-400 italic text-sm bg-slate-800 p-3 rounded-lg my-2">{line.replace(/\*/g, '')}</p>;
                                }
                                return line ? <p key={i} className="text-slate-300">{line}</p> : <br key={i} />;
                            })}
                        </div>

                        {/* Copy Prompt Button (only on ChatGPT slide) */}
                        {slide.id === 'chatgpt' && (
                            <button
                                onClick={copyPrompt}
                                className="mt-4 w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-5 w-5 text-green-400" />
                                        Copied to Clipboard!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-5 w-5" />
                                        Copy ChatGPT Prompt Template
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
                        {/* Progress Dots */}
                        <div className="flex gap-2">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-2">
                            {currentSlide > 0 && (
                                <button
                                    onClick={prevSlide}
                                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={nextSlide}
                                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center gap-1"
                            >
                                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

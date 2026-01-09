'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Brain, Sparkles } from 'lucide-react';

const loadingMessages = [
    'Analyzing knowledge domain...',
    'Curating authoritative resources...',
    'Building prerequisite chains...',
    'Designing rigorous assessments...',
    'Finalizing curriculum structure...',
];

export function LoadingAI() {
    const [messageIndex, setMessageIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-12 max-w-md text-center"
            >
                {/* Animated brain */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="mx-auto w-24 h-24 mb-6 relative"
                >
                    <Brain className="w-24 h-24 text-blue-500" />
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0"
                    >
                        <Sparkles className="w-6 h-6 text-cyan-400 absolute top-0 right-0" />
                        <Sparkles className="w-4 h-4 text-blue-400 absolute bottom-2 left-2" />
                    </motion.div>
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-4 gradient-text from-blue-400 to-cyan-400">
                    AI Architect at Work
                </h2>

                {/* Rotating messages */}
                <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-zinc-400 mb-6"
                >
                    {loadingMessages[messageIndex]}
                </motion.p>

                {/* Spinner */}
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
            </motion.div>
        </div>
    );
}

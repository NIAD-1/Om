'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ProgressRing } from '../ui/progress-ring';

interface DomainCardProps {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string; // gradient classes
    progress: number;
    moduleCount: number;
    onSelect: (id: string) => void;
}

export function DomainCard({
    id,
    name,
    description,
    icon: Icon,
    color,
    progress,
    moduleCount,
    onSelect,
}: DomainCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(id)}
            className="card-hover cursor-pointer group relative overflow-hidden"
        >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    {/* Icon with gradient background */}
                    <motion.div
                        className={`p-4 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Progress ring */}
                    <ProgressRing progress={progress} size={70} strokeWidth={6} />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {name}
                </h3>

                {/* Description */}
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2 min-h-[40px]">{description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color} shadow-lg`} />
                        <span className="text-zinc-400">{moduleCount} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${progress === 100 ? 'bg-green-500' : progress === 0 ? 'bg-zinc-600' : 'bg-blue-500'}`} />
                        <span className="text-zinc-400">
                            {progress === 100 ? 'Mastered' : progress === 0 ? 'Start Learning' : 'In Progress'}
                        </span>
                    </div>
                </div>

                {/* Animated hover indicator */}
                <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    className={`h-1 mt-4 rounded-full bg-gradient-to-r ${color} shadow-lg`}
                />
            </div>
        </motion.div>
    );
}

'use client';

import React from 'react';

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    showPercentage?: boolean;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 8,
    color = '#3b82f6',
    showPercentage = true,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="progress-ring-circle transition-all duration-500 ease-out"
                />
            </svg>
            {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color }}>
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Code, Clock, CheckCircle2, Circle, ExternalLink } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours: number;
    objectives: string[];
    tasks: Array<{
        id: string;
        title: string;
        description: string;
        estimatedMinutes: number;
    }>;
    resources?: Array<{
        type: string;
        title: string;
        url: string;
        authority: string;
    }>;
}

export default function ProjectDetailPage() {
    const router = useRouter();
    const params = useParams();
    const curriculumId = params.id as string;
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [curriculumTitle, setCurriculumTitle] = useState('');
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

    useEffect(() => {
        const curricula = JSON.parse(localStorage.getItem('curricula') || '[]');
        const curriculum = curricula.find((c: any) => c.id === curriculumId);

        if (!curriculum) {
            router.push('/learning-paths');
            return;
        }

        setCurriculumTitle(curriculum.field);

        const foundProject = curriculum.projects?.find((p: Project) => p.id === projectId);

        if (!foundProject) {
            router.push(`/learning-paths/${curriculumId}`);
            return;
        }

        setProject(foundProject);

        // Load completed tasks from localStorage
        const saved = localStorage.getItem(`project-${projectId}-tasks`);
        if (saved) {
            setCompletedTasks(new Set(JSON.parse(saved)));
        }
    }, [curriculumId, projectId, router]);

    const toggleTask = (taskId: string) => {
        const newCompleted = new Set(completedTasks);
        if (newCompleted.has(taskId)) {
            newCompleted.delete(taskId);
        } else {
            newCompleted.add(taskId);
        }
        setCompletedTasks(newCompleted);
        localStorage.setItem(`project-${projectId}-tasks`, JSON.stringify(Array.from(newCompleted)));
    };

    if (!project) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    const difficultyColors = {
        beginner: 'bg-green-500/10 text-green-400 border-green-500/30',
        intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        advanced: 'bg-red-500/10 text-red-400 border-red-500/30',
    };

    const completionPercentage = project.tasks.length > 0
        ? Math.round((completedTasks.size / project.tasks.length) * 100)
        : 0;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/learning-paths/${curriculumId}`)}
                        className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">{curriculumTitle}</p>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[project.difficulty]}`}>
                                {project.difficulty}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{project.estimatedHours} hours</span>
                            </div>
                            <div className="text-sm text-slate-400">
                                {completedTasks.size}/{project.tasks.length} tasks completed  ({completionPercentage}%)
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <Code className="h-5 w-5 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">Project Overview</h2>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{project.description}</p>
                </div>

                {/* Learning Objectives */}
                {project.objectives && project.objectives.length > 0 && (
                    <div className="card">
                        <h3 className="font-semibold text-white mb-3">Learning Objectives</h3>
                        <ul className="space-y-2">
                            {project.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-300">
                                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <span>{obj}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Tasks Checklist */}
                <div className="card">
                    <h3 className="font-semibold text-white mb-4">Tasks</h3>
                    <div className="space-y-3">
                        {project.tasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700 hover:border-blue-500/50 cursor-pointer transition-colors group"
                            >
                                <button className="mt-0.5">
                                    {completedTasks.has(task.id) ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-slate-600 group-hover:text-blue-400" />
                                    )}
                                </button>
                                <div className="flex-1">
                                    <h4 className={`font-medium ${completedTasks.has(task.id) ? 'text-slate-500 line-through' : 'text-white'}`}>
                                        {task.title}
                                    </h4>
                                    <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                                        <Clock className="h-3 w-3" />
                                        {task.estimatedMinutes} minutes
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resources */}
                {project.resources && project.resources.length > 0 && (
                    <div className="card">
                        <h3 className="font-semibold text-white mb-4">Helpful Resources</h3>
                        <div className="space-y-3">
                            {project.resources.map((resource, idx) => (
                                <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 rounded-lg bg-slate-800/30 border border-slate-700 hover:border-blue-500/50 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                                {resource.title}
                                            </h4>
                                            <p className="text-sm text-slate-400">{resource.authority}</p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-blue-400" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action */}
                {completionPercentage === 100 && (
                    <div className="card bg-green-500/10 border-green-500/30 text-center">
                        <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Project Complete! 🎉</h3>
                        <p className="text-slate-300">
                            Great job completing all tasks. Ready for the next challenge?
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

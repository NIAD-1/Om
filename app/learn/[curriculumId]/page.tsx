'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Lock, CheckCircle, Circle } from 'lucide-react';
import type { Module, Topic, Lesson } from '@/types/curriculum';
import { useAuth } from '@/contexts/auth-context';
import { getCurricula, getProgress } from '@/lib/firestore';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 240;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    dagreGraph.setGraph({ rankdir: 'LR' }); // Left-to-right layout

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Left;
        node.sourcePosition = Position.Right;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

// Custom node component
const LessonNode = ({ data }: any) => {
    const isLocked = data.status === 'locked';
    const isCompleted = data.status === 'completed';
    const isInProgress = data.status === 'in-progress';

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 min-w-[200px] cursor-pointer transition-all ${isLocked ? 'bg-slate-800 border-slate-700 opacity-50' :
                isCompleted ? 'bg-green-900/30 border-green-500' :
                    isInProgress ? 'bg-yellow-900/30 border-yellow-500' :
                        'bg-blue-900/30 border-blue-500 hover:border-blue-400'
                }`}
            onClick={() => !isLocked && data.onClick()}
        >
            <div className="flex items-center gap-2 mb-1">
                {isLocked && <Lock className="h-4 w-4 text-slate-500" />}
                {isCompleted && <CheckCircle className="h-4 w-4 text-green-400" />}
                {isInProgress && <Circle className="h-4 w-4 text-yellow-400" />}
                <span className={`font-medium text-sm ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                    {data.label}
                </span>
            </div>
            <div className="text-xs text-slate-400">{data.minutes} min</div>
        </div>
    );
};

const nodeTypes = {
    lesson: LessonNode,
};

export default function LearningMapPage() {
    const router = useRouter();
    const params = useParams();
    const curriculumId = params.curriculumId as string;
    const { user } = useAuth();

    const [curriculum, setCurriculum] = useState<any>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [progress, setProgress] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadCurriculum = async () => {
            if (!user) return;

            try {
                const curricula = await getCurricula(user.uid);
                const found = curricula.find((c: any) => c.id === curriculumId);

                if (!found) {
                    router.push('/learning-paths');
                    return;
                }

                setCurriculum(found);

                // Load progress from Firestore
                const savedData = await getProgress(user.uid, curriculumId);
                const savedProgress = savedData.completedLessons;
                if (savedProgress.length > 0) {
                    setProgress(new Set(savedProgress));
                }

                // Build nodes and edges
                const initialNodes: Node[] = [];
                const initialEdges: Edge[] = [];

                found.modules?.forEach((module: Module) => {
                    module.topics?.forEach((topic: Topic) => {
                        topic.lessons?.forEach((lesson: Lesson) => {
                            const isUnlocked = lesson.prerequisites.length === 0 ||
                                lesson.prerequisites.every(prereq => savedProgress.includes(prereq));

                            initialNodes.push({
                                id: lesson.id,
                                type: 'lesson',
                                data: {
                                    label: lesson.name,
                                    minutes: lesson.estimatedMinutes,
                                    status: savedProgress.includes(lesson.id) ? 'completed' :
                                        isUnlocked ? 'unlocked' : 'locked',
                                    onClick: () => {
                                        if (isUnlocked) {
                                            router.push(`/learning-paths/${curriculumId}/lesson/${lesson.id}`);
                                        }
                                    }
                                },
                                position: { x: 0, y: 0 } // Position will be set by dagre
                            });

                            // Create edges for prerequisites
                            lesson.prerequisites?.forEach(prereqId => {
                                initialEdges.push({
                                    id: `${prereqId}-${lesson.id}`,
                                    source: prereqId,
                                    target: lesson.id,
                                    type: 'smoothstep',
                                    animated: savedProgress.includes(prereqId),
                                    markerEnd: {
                                        type: MarkerType.ArrowClosed,
                                        color: '#3b82f6',
                                    },
                                    style: { stroke: '#3b82f6' },
                                });
                            });
                        });
                    });
                });

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    initialNodes,
                    initialEdges
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            } catch (error) {
                console.error('Failed to load curriculum', error);
                router.push('/learning-paths');
            }
        };

        loadCurriculum();
    }, [curriculumId, router, setNodes, setEdges, user]);

    if (!curriculum) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="h-screen flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/learning-paths/${curriculumId}`)}
                            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{curriculum.field}</h1>
                            <p className="text-sm text-slate-400">Interactive Learning Map</p>
                        </div>
                    </div>
                </div>

                {/* React Flow Canvas */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-slate-950"
                    >
                        <Background color="#1e293b" gap={16} />
                        <Controls className="bg-slate-800 border-slate-700" />
                    </ReactFlow>
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-slate-700 bg-slate-800"></div>
                            <span className="text-sm text-slate-400">Locked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-900/30"></div>
                            <span className="text-sm text-slate-400">Unlocked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-900/30"></div>
                            <span className="text-sm text-slate-400">Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

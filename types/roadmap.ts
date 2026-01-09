// Roadmap type definitions

export interface RoadmapCurriculumRef {
    curriculumId: string;
    order: number;
    locked: boolean;
}

export interface Roadmap {
    id: string;
    title: string;
    description: string;
    domain: string;
    curricula: RoadmapCurriculumRef[];
    createdAt: string;
    completedCurricula: string[]; // IDs of finished curricula
}

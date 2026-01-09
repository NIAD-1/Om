// Core curriculum types
export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
  prerequisites: string[]; // Module IDs
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  lessons: Lesson[];
  prerequisites: string[]; // Topic IDs
}

export interface Lesson {
  id: string;
  name: string;
  content: LessonContent;
  examId: string;
  prerequisites: string[]; // Lesson IDs
  estimatedMinutes: number;
}

export interface LessonContent {
  summary: string; // Markdown
  resources: Resource[];
}

export interface Resource {
  type: 'video' | 'article' | 'documentation' | 'book';
  title: string;
  url: string;
  authority: string; // e.g., "MIT OCW", "3Blue1Brown"
  duration?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  moduleId?: string; // Optional: which module this project belongs to
  prerequisites: string[]; // Lesson IDs that should be completed first
  objectives: string[]; // Learning objectives
  tasks: ProjectTask[];
  resources: Resource[];
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed?: boolean;
}

export interface Exam {
  id: string;
  lessonId: string;
  questions: Question[];
  passingScore: number; // Default 85
  timeLimit?: number; // minutes
}

export interface Question {
  id: string;
  question: string; // Can include LaTeX wrapped in $$
  type: 'multiple-choice' | 'code';
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserProgress {
  userId: string;
  domainId: string;
  completedLessons: string[]; // Lesson IDs
  examScores: Record<string, ExamResult>; // examId -> result
  currentStreak: number;
  lastActivityDate: string;
}

export interface ExamResult {
  examId: string;
  score: number; // 0-100
  passed: boolean;
  completedAt: string;
  answers: Record<string, number>; // questionId -> selected index
}

export interface NodeStatus {
  id: string;
  type: 'module' | 'topic' | 'lesson';
  status: 'locked' | 'unlocked' | 'mastered';
  progress: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  lessonContext?: string; // Lesson ID for context
}

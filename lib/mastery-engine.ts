import { UserProgress, NodeStatus, ExamResult } from '@/types/curriculum';

/**
 * Calculate overall progress for a domain
 */
export function calculateDomainProgress(
    totalLessons: number,
    completedLessons: number
): number {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
}

/**
 * Check if prerequisites are met for a node
 */
export function checkPrerequisites(
    prerequisiteIds: string[],
    completedLessonIds: string[]
): boolean {
    if (prerequisiteIds.length === 0) return true;
    return prerequisiteIds.every((prereqId) => completedLessonIds.includes(prereqId));
}

/**
 * Evaluate exam and determine if user passed
 */
export function evaluateExam(
    correctAnswers: Record<string, number>,
    userAnswers: Record<string, number>,
    passingScore: number = 85
): ExamResult {
    const totalQuestions = Object.keys(correctAnswers).length;
    let correctCount = 0;

    Object.keys(correctAnswers).forEach((questionId) => {
        if (correctAnswers[questionId] === userAnswers[questionId]) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= passingScore;

    return {
        examId: '', // Will be set by caller
        score,
        passed,
        completedAt: new Date().toISOString(),
        answers: userAnswers,
    };
}

/**
 * Determine node status based on progress
 */
export function getNodeStatus(
    nodeId: string,
    type: 'module' | 'topic' | 'lesson',
    prerequisiteIds: string[],
    completedLessonIds: string[],
    examScores: Record<string, ExamResult>
): NodeStatus {
    const prerequisitesMet = checkPrerequisites(prerequisiteIds, completedLessonIds);

    if (!prerequisitesMet) {
        return {
            id: nodeId,
            type,
            status: 'locked',
            progress: 0,
        };
    }

    if (type === 'lesson') {
        const examPassed = examScores[nodeId]?.passed;
        return {
            id: nodeId,
            type,
            status: examPassed ? 'mastered' : 'unlocked',
            progress: examPassed ? 100 : 0,
        };
    }

    // For modules/topics, calculate based on child lessons
    return {
        id: nodeId,
        type,
        status: 'unlocked',
        progress: 0, // Will be calculated by aggregating child lessons
    };
}

/**
 * Get next recommended lesson based on current progress
 */
export function getNextRecommendation(
    allLessonIds: string[],
    completedLessonIds: string[],
    lessonPrerequisites: Record<string, string[]>
): string | null {
    for (const lessonId of allLessonIds) {
        if (completedLessonIds.includes(lessonId)) continue;

        const prerequisites = lessonPrerequisites[lessonId] || [];
        if (checkPrerequisites(prerequisites, completedLessonIds)) {
            return lessonId;
        }
    }

    return null; // All lessons completed or none available
}

/**
 * Calculate streak based on activity dates
 */
export function calculateStreak(activityDates: string[]): number {
    if (activityDates.length === 0) return 0;

    const sortedDates = activityDates
        .map((d) => new Date(d).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a);

    let streak = 1;
    const today = new Date().setHours(0, 0, 0, 0);

    if (sortedDates[0] < today - 86400000) return 0; // More than 1 day since last activity

    for (let i = 0; i < sortedDates.length - 1; i++) {
        const diff = sortedDates[i] - sortedDates[i + 1];
        if (diff === 86400000) {
            // Exactly 1 day
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    deleteDoc,
    query,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Helper to get user-scoped collection path
const getUserPath = (userId: string, collectionName: string) => {
    return `users/${userId}/${collectionName}`;
};

// ====== CURRICULA ======

export async function saveCurriculum(userId: string, curriculum: any) {
    const docRef = doc(db, getUserPath(userId, 'curricula'), curriculum.id);
    await setDoc(docRef, {
        ...curriculum,
        updatedAt: new Date().toISOString(),
    });
}

export async function getCurricula(userId: string): Promise<any[]> {
    const q = query(collection(db, getUserPath(userId, 'curricula')));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteCurriculum(userId: string, curriculumId: string) {
    await deleteDoc(doc(db, getUserPath(userId, 'curricula'), curriculumId));
}

// ====== ROADMAPS ======

export async function saveRoadmap(userId: string, roadmap: any) {
    const docRef = doc(db, getUserPath(userId, 'roadmaps'), roadmap.id);
    await setDoc(docRef, {
        ...roadmap,
        updatedAt: new Date().toISOString(),
    });
}

export async function getRoadmaps(userId: string): Promise<any[]> {
    const q = query(collection(db, getUserPath(userId, 'roadmaps')));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteRoadmap(userId: string, roadmapId: string) {
    await deleteDoc(doc(db, getUserPath(userId, 'roadmaps'), roadmapId));
}

// ====== PROGRESS ======

export async function saveProgress(userId: string, curriculumId: string, completedLessons: string[]) {
    const docRef = doc(db, getUserPath(userId, 'progress'), curriculumId);
    await setDoc(docRef, {
        completedLessons,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}

export async function saveVideoProgress(userId: string, curriculumId: string, lessonId: string, timestamp: number) {
    const docRef = doc(db, getUserPath(userId, 'progress'), curriculumId);
    // Use dot notation to update a specific key in the map without overwriting
    await updateDoc(docRef, {
        [`timestamps.${lessonId}`]: timestamp,
        updatedAt: new Date().toISOString(),
    }).catch(async (error) => {
        // If document doesn't exist, create it
        if (error.code === 'not-found') {
            await setDoc(docRef, {
                completedLessons: [],
                timestamps: { [lessonId]: timestamp },
                updatedAt: new Date().toISOString(),
            });
        } else {
            throw error;
        }
    });
}

export async function getProgress(userId: string, curriculumId: string): Promise<{ completedLessons: string[], timestamps: Record<string, number> }> {
    const docRef = doc(db, getUserPath(userId, 'progress'), curriculumId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        const data = snapshot.data();
        return {
            completedLessons: data.completedLessons || [],
            timestamps: data.timestamps || {}
        };
    }
    return { completedLessons: [], timestamps: {} };
}

// ====== USER PROFILE ======

export async function saveUserProfile(userId: string, profile: { email: string; displayName?: string }) {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}

// ====== CHALLENGES ======

export async function saveChallenges(userId: string, challenges: any[]) {
    const docRef = doc(db, getUserPath(userId, 'settings'), 'challenges');
    await setDoc(docRef, {
        challenges,
        updatedAt: new Date().toISOString(),
    });
}

export async function getChallenges(userId: string): Promise<any[]> {
    const docRef = doc(db, getUserPath(userId, 'settings'), 'challenges');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return snapshot.data().challenges || [];
    }
    return [];
}

// ====== PROJECT TASKS ======

export async function saveProjectTasks(userId: string, projectId: string, completedTasks: string[]) {
    const docRef = doc(db, getUserPath(userId, 'projectTasks'), projectId);
    await setDoc(docRef, {
        completedTasks,
        updatedAt: new Date().toISOString(),
    });
}

export async function getProjectTasks(userId: string, projectId: string): Promise<string[]> {
    const docRef = doc(db, getUserPath(userId, 'projectTasks'), projectId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return snapshot.data().completedTasks || [];
    }
    return [];
}

// ====== ACTIVITY LOG ======

export interface ActivityEntry {
    id: string;
    type: 'video_watch' | 'lesson_complete' | 'quiz_pass' | 'exam_pass' | 'project_task';
    curriculumId: string;
    curriculumTitle: string;
    lessonId?: string;
    lessonName?: string;
    roadmapId?: string;
    roadmapTitle?: string;
    minutesSpent: number;
    timestamp: string;
}

export async function logActivity(userId: string, activity: Omit<ActivityEntry, 'id' | 'timestamp'>) {
    const activityId = crypto.randomUUID();
    const docRef = doc(db, getUserPath(userId, 'activityLog'), activityId);
    await setDoc(docRef, {
        ...activity,
        id: activityId,
        timestamp: new Date().toISOString(),
    });
}

export async function getRecentActivities(userId: string, limit: number = 10): Promise<ActivityEntry[]> {
    const q = query(collection(db, getUserPath(userId, 'activityLog')));
    const snapshot = await getDocs(q);
    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityEntry));
    // Sort by timestamp descending and limit
    return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
}

export async function getActivityStats(userId: string): Promise<{
    totalMinutesToday: number;
    totalMinutesThisWeek: number;
    lessonsCompletedThisWeek: number;
    currentStreak: number;
}> {
    const activities = await getRecentActivities(userId, 1000); // Get all recent

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

    let totalMinutesToday = 0;
    let totalMinutesThisWeek = 0;
    let lessonsCompletedThisWeek = 0;

    activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp);

        if (activityDate >= todayStart) {
            totalMinutesToday += activity.minutesSpent;
        }

        if (activityDate >= weekStart) {
            totalMinutesThisWeek += activity.minutesSpent;
            if (activity.type === 'lesson_complete') {
                lessonsCompletedThisWeek++;
            }
        }
    });

    // Calculate streak (consecutive days with activity)
    let currentStreak = 0;
    const dayChecked = new Set<string>();
    const sortedActivities = [...activities].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    for (const activity of sortedActivities) {
        const dateStr = new Date(activity.timestamp).toDateString();
        if (!dayChecked.has(dateStr)) {
            dayChecked.add(dateStr);
        }
    }

    // Count consecutive days from today backwards
    const checkDate = new Date(todayStart);
    for (let i = 0; i < 365; i++) {
        if (dayChecked.has(checkDate.toDateString())) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
            // Today might not have activity yet, check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
            if (dayChecked.has(checkDate.toDateString())) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return {
        totalMinutesToday,
        totalMinutesThisWeek,
        lessonsCompletedThisWeek,
        currentStreak
    };
}

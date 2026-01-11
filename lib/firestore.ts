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

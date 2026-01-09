'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function AssessmentsPage() {
    return (
        <DashboardLayout>
            <div className="card text-center py-12">
                <h1 className="text-3xl font-bold text-white mb-4">Assessments</h1>
                <p className="text-slate-400">
                    Take exams and quizzes to test your mastery.
                </p>
            </div>
        </DashboardLayout>
    );
}

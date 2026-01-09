'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function ProgressPage() {
    return (
        <DashboardLayout>
            <div className="card text-center py-12">
                <h1 className="text-3xl font-bold text-white mb-4">Progress Tracking</h1>
                <p className="text-slate-400">
                    View your learning statistics and milestones.
                </p>
            </div>
        </DashboardLayout>
    );
}

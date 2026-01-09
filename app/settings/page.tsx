'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="card text-center py-12">
                <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
                <p className="text-slate-400">
                    Manage your account and preferences.
                </p>
            </div>
        </DashboardLayout>
    );
}

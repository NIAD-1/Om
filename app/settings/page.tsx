'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { motion } from 'framer-motion';
import {
    Settings,
    User,
    Bell,
    Shield,
    HelpCircle,
    Moon,
    Volume2,
    RotateCcw,
    ExternalLink,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [soundEffects, setSoundEffects] = useState(false);

    const handleResetOnboarding = () => {
        localStorage.removeItem('hasSeenOnboarding');
        alert('Onboarding will show on your next visit to the Dashboard!');
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error('Failed to logout', e);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-slate-400">Manage your account and preferences</p>
                </div>

                {/* Account Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <User className="h-5 w-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Account</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                            <div>
                                <p className="text-sm text-slate-400">Email</p>
                                <p className="text-white">{user?.email || 'Not signed in'}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                            <div>
                                <p className="text-sm text-slate-400">Display Name</p>
                                <p className="text-white">{user?.displayName || 'Anonymous Learner'}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </motion.div>

                {/* Preferences Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Settings className="h-5 w-5 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">Preferences</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-white">Notifications</p>
                                    <p className="text-sm text-slate-500">Get reminders for daily learning</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-blue-500' : 'bg-slate-600'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Moon className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-white">Dark Mode</p>
                                    <p className="text-sm text-slate-500">Always enabled for optimal focus</p>
                                </div>
                            </div>
                            <button
                                disabled
                                className="relative w-12 h-6 rounded-full bg-blue-500 opacity-50 cursor-not-allowed"
                            >
                                <span className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Volume2 className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-white">Sound Effects</p>
                                    <p className="text-sm text-slate-500">Play sounds on achievements</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSoundEffects(!soundEffects)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${soundEffects ? 'bg-blue-500' : 'bg-slate-600'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEffects ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <HelpCircle className="h-5 w-5 text-green-400" />
                        <h2 className="text-xl font-semibold text-white">Help & Support</h2>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleResetOnboarding}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-left"
                        >
                            <RotateCcw className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-white">Show Onboarding Tutorial</p>
                                <p className="text-sm text-slate-500">Learn how to use all features</p>
                            </div>
                        </button>

                        <a
                            href="https://github.com/NIAD-1/Om"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                        >
                            <ExternalLink className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-white">View on GitHub</p>
                                <p className="text-sm text-slate-500">See source code and contribute</p>
                            </div>
                        </a>
                    </div>
                </motion.div>

                {/* Security Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-green-400" />
                        <h2 className="text-lg font-semibold text-white">Data Protection</h2>
                    </div>
                    <p className="text-slate-400 text-sm">
                        Your learning data is securely stored in Firebase and only accessible to you.
                        We use industry-standard encryption and authentication to protect your information.
                    </p>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

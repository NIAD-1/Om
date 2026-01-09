'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
    Brain,
    LayoutDashboard,
    BookOpen,
    Target,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Sparkles,
    Code,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Learning Paths', href: '/learning-paths', icon: BookOpen },
        { name: 'Roadmaps', href: '/roadmaps', icon: Target },
        { name: 'Assessments', href: '/assessments', icon: Target },
        { name: 'Challenges', href: '/challenges', icon: Code },
        { name: 'Progress', href: '/progress', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-950 text-white">
                {/* Sidebar - Desktop Fixed */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="flex h-full flex-col">
                        {/* Logo */}
                        <div className="flex items-center gap-3 border-b border-slate-800 p-6">
                            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white tracking-tight">Mastery Engine</h1>
                                <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                                    AI Knowledge System
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group ${isActive
                                            ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User section */}
                        <div className="border-t border-slate-800 p-4 space-y-2">
                            {user && (
                                <div className="px-4 py-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                        {user.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm text-slate-300 truncate">{user.email}</span>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex-1" /> {/* Spacer */}

                        <div className="flex items-center gap-4">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20 ring-2 ring-slate-900">
                                ME
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute >
    );
}

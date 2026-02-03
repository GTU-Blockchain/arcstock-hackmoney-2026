"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    showSearch?: boolean;
}

export function DashboardLayout({
    children,
    title,
    subtitle,
    actions,
    showSearch = true,
}: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
                    <div className="flex items-center gap-6">
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                            {title}
                        </h2>
                        {showSearch && (
                            <div className="relative w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    search
                                </span>
                                <input
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Search holders, txs..."
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {actions}
                        {/* Profile Avatar */}
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500">
                                person
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Page Header */}
                    {(title || subtitle) && (
                        <div className="mb-8">
                            <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight mb-2">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-slate-500 dark:text-slate-400 text-lg">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Children */}
                    {children}
                </div>
            </main>
        </div>
    );
}

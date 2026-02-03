"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
    href: string;
    label: string;
    icon: string;
}

const sidebarItems: SidebarItem[] = [
    { href: "/issuer", label: "Dashboard", icon: "dashboard" },
    { href: "/issuer/cap-table", label: "Cap Table", icon: "groups" },
    { href: "/treasury", label: "Treasury", icon: "account_balance_wallet" },
    { href: "/issuer/governance", label: "Governance", icon: "gavel" },
    { href: "/issuer/settings", label: "Settings", icon: "settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col min-h-screen">
            {/* Brand */}
            <div className="p-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-primary text-xl font-black leading-normal tracking-tight">
                        EquityChain
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        Issuer Portal
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <p
                                    className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}
                                >
                                    {item.label}
                                </p>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Support Button */}
            <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
                <button className="w-full flex items-center justify-center gap-2 rounded-lg h-10 bg-primary text-white text-sm font-bold hover:brightness-110 transition-all">
                    <span className="material-symbols-outlined text-sm">
                        support_agent
                    </span>
                    <span>Support</span>
                </button>
            </div>
        </aside>
    );
}

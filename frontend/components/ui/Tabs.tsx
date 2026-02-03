"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef, useState } from "react";

export interface Tab {
    id: string;
    label: string;
    icon?: string;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    tabs: Tab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
    ({ className, tabs, activeTab, onTabChange, ...props }, ref) => {
        const [internalActive, setInternalActive] = useState(tabs[0]?.id);
        const currentActive = activeTab ?? internalActive;

        const handleTabClick = (tabId: string) => {
            setInternalActive(tabId);
            onTabChange?.(tabId);
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex border-b border-slate-200 dark:border-slate-800",
                    className
                )}
                {...props}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                            currentActive === tab.id
                                ? "text-primary border-primary"
                                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-primary"
                        )}
                    >
                        {tab.icon && (
                            <span className="material-symbols-outlined text-sm">
                                {tab.icon}
                            </span>
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    }
);

Tabs.displayName = "Tabs";

export { Tabs };

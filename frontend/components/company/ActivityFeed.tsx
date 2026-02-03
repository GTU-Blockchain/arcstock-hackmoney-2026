"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Activity, ActivityType } from "@/types";
import { getRelativeTime } from "@/lib/utils";

interface ActivityFeedProps {
    activities: Activity[];
}

const activityIcons: Record<ActivityType, { icon: string; color: string }> = {
    investment: { icon: "payments", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    dividend: { icon: "volunteer_activism", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    buyback: { icon: "autorenew", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    issuance: { icon: "add_circle", color: "bg-primary/10 text-primary" },
    legal_update: { icon: "gavel", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
    governance: { icon: "how_to_vote", color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
};

const filterOptions = ["All", "Dividends", "Buybacks", "Issuance"];

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredActivities = activities.filter((activity) => {
        if (activeFilter === "All") return true;
        return activity.type === activeFilter.toLowerCase().slice(0, -1); // Remove 's'
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Recent Activity
                </h3>
                <div className="flex gap-2">
                    {filterOptions.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors ${activeFilter === filter
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity Items */}
            <div className="flex flex-col">
                {filteredActivities.map((activity) => {
                    const { icon, color } = activityIcons[activity.type];
                    return (
                        <div
                            key={activity.id}
                            className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors last:border-b-0"
                        >
                            <div className={`p-3 rounded-lg flex items-center justify-center ${color}`}>
                                <span className="material-symbols-outlined">{icon}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                        {activity.title}
                                    </h4>
                                    <span className="text-sm text-slate-400">
                                        {getRelativeTime(activity.createdAt)}
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    {activity.description}
                                </p>
                                <div className="mt-2 flex items-center gap-4">
                                    {activity.txHash && (
                                        <Badge variant="primary" size="sm">
                                            TX Hash: {activity.txHash}
                                        </Badge>
                                    )}
                                    {activity.amount && (
                                        <span
                                            className={`text-xs font-bold ${activity.amount > 0 ? "text-green-600" : "text-red-500"
                                                }`}
                                        >
                                            {activity.amount > 0 ? "+" : ""}$
                                            {Math.abs(activity.amount).toLocaleString()} USDC
                                        </span>
                                    )}
                                    {activity.shares && (
                                        <span className="text-xs font-bold text-purple-600">
                                            {activity.shares.toLocaleString()} Shares
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View More Button */}
            <button className="w-full py-4 text-sm font-bold text-primary bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                View Full History
            </button>
        </div>
    );
}

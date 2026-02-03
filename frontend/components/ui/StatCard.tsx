import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    trend?: {
        value: number;
        label?: string;
    };
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
    ({ className, title, value, subtitle, icon, trend, ...props }, ref) => {
        const isPositive = trend && trend.value >= 0;

        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm",
                    className
                )}
                {...props}
            >
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
                        {title}
                    </p>
                    {icon && (
                        <span className="material-symbols-outlined text-primary">
                            {icon}
                        </span>
                    )}
                </div>
                <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-black leading-tight">
                    {value}
                </p>
                {(trend || subtitle) && (
                    <div className="flex items-center gap-2">
                        {trend && (
                            <p
                                className={cn(
                                    "text-sm font-semibold flex items-center gap-1",
                                    isPositive ? "text-emerald-500" : "text-red-500"
                                )}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {isPositive ? "trending_up" : "trending_down"}
                                </span>
                                {isPositive ? "+" : ""}
                                {trend.value}%
                                {trend.label && (
                                    <span className="font-normal text-slate-400 ml-1">
                                        {trend.label}
                                    </span>
                                )}
                            </p>
                        )}
                        {subtitle && !trend && (
                            <p className="text-slate-400 text-sm font-medium">{subtitle}</p>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

StatCard.displayName = "StatCard";

export { StatCard };

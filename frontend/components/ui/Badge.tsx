import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "warning" | "danger" | "info" | "default" | "primary";
    size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
        const variants = {
            success:
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
            warning:
                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
            danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
            info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
            primary:
                "bg-primary/10 text-primary",
            default:
                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        };

        const sizes = {
            sm: "px-2 py-0.5 text-[10px]",
            md: "px-2.5 py-1 text-xs",
        };

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center font-bold rounded-full uppercase tracking-wider",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = "Badge";

export { Badge };

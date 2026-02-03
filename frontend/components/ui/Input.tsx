import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    suffix?: string;
    icon?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, suffix, icon, type = "text", ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 text-sm font-medium",
                            "focus:ring-2 focus:ring-primary focus:border-transparent outline-none",
                            "placeholder:text-slate-400 dark:text-white",
                            "transition-colors",
                            icon && "pl-10",
                            suffix && "pr-16",
                            error && "border-danger focus:ring-danger",
                            className
                        )}
                        {...props}
                    />
                    {suffix && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {suffix}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1 text-xs text-danger font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };

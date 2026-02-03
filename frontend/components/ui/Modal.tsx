"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef, useEffect, useCallback } from "react";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
    ({ className, isOpen, onClose, title, subtitle, children, ...props }, ref) => {
        const handleEscape = useCallback(
            (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            },
            [onClose]
        );

        useEffect(() => {
            if (isOpen) {
                document.addEventListener("keydown", handleEscape);
                document.body.style.overflow = "hidden";
            }
            return () => {
                document.removeEventListener("keydown", handleEscape);
                document.body.style.overflow = "unset";
            };
        }, [isOpen, handleEscape]);

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div
                    ref={ref}
                    className={cn(
                        "relative bg-white dark:bg-slate-900 w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden",
                        "animate-in fade-in zoom-in-95 duration-200",
                        className
                    )}
                    {...props}
                >
                    {/* Header */}
                    {(title || subtitle) && (
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                            <div>
                                {title && (
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {title}
                                    </h3>
                                )}
                                {subtitle && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}

                    {/* Body */}
                    <div className="p-6">{children}</div>
                </div>
            </div>
        );
    }
);

Modal.displayName = "Modal";

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> { }

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 -mx-6 -mb-6 mt-6",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

ModalFooter.displayName = "ModalFooter";

export { Modal, ModalFooter };

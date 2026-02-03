import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef, ReactNode } from "react";

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

export interface TableProps<T> extends HTMLAttributes<HTMLDivElement> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
}

function Table<T extends { id?: string | number }>({
    className,
    columns,
    data,
    onRowClick,
    ...props
}: TableProps<T>) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm",
                className
            )}
            {...props}
        >
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className={cn(
                                    "px-6 py-4 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider",
                                    column.className
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={item.id ?? index}
                            onClick={() => onRowClick?.(item)}
                            className={cn(
                                "border-t border-slate-100 dark:border-slate-800",
                                "hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors",
                                onRowClick && "cursor-pointer"
                            )}
                        >
                            {columns.map((column) => (
                                <td
                                    key={String(column.key)}
                                    className={cn("px-6 py-5", column.className)}
                                >
                                    {column.render
                                        ? column.render(item)
                                        : String((item as Record<string, unknown>)[String(column.key)] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { Table };

import Link from "next/link";

interface ActionItem {
    icon: string;
    title: string;
    description: string;
    href: string;
    variant?: "default" | "danger";
}

const actions: ActionItem[] = [
    {
        icon: "account_balance",
        title: "Treasury Management",
        description: "Rebalance holdings across chain-abstracted vaults.",
        href: "/issuer/treasury",
        variant: "default",
    },
    {
        icon: "cancel",
        title: "Cancel Shares (Buyback)",
        description: "Execute repurchase programs and burn equity tokens.",
        href: "/issuer/buyback",
        variant: "danger",
    },
    {
        icon: "add_box",
        title: "Issue New Shares",
        description: "Configure and launch a new equity issuance round.",
        href: "/issuer/issue",
        variant: "default",
    },
    {
        icon: "payments",
        title: "Distribute Dividends",
        description: "Instant distribution to all global shareholders.",
        href: "/issuer/dividends",
        variant: "default",
    },
];

export function PrimaryActions() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <h2 className="text-slate-900 dark:text-white text-lg font-bold px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                Primary Actions
            </h2>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action) => (
                    <Link
                        key={action.title}
                        href={action.href}
                        className={`flex items-start gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors ${action.variant === "danger"
                                ? "hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <div
                            className={`p-3 rounded-lg ${action.variant === "danger"
                                    ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600"
                                    : "bg-primary/10 text-primary"
                                }`}
                        >
                            <span className="material-symbols-outlined">{action.icon}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                {action.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {action.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

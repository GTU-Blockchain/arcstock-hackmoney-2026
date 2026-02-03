"use client";

import { AgentRule } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface RulesListProps {
    rules?: AgentRule[];
    onEdit?: (rule: AgentRule) => void;
    onDelete?: (rule: AgentRule) => void;
}

const defaultRules: AgentRule[] = [
    {
        id: "1",
        name: "High Demand Auto-Issuance",
        description:
            "When secondary market trades at 5%+ premium for 3+ days, trigger automated share issuance proposal.",
        trigger: "premium",
        threshold: 0.05,
        action: "issue_shares",
        isActive: true,
        lastTriggered: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
    {
        id: "2",
        name: "Surplus Dividend Distribution",
        description:
            "When treasury balance exceeds $10M and no scheduled buyback, trigger dividend distribution to all holders.",
        trigger: "balance",
        threshold: 10000000,
        action: "distribute_dividends",
        isActive: true,
    },
    {
        id: "3",
        name: "Strategic Buyback Execution",
        description:
            "When equity trades at 10%+ discount to NAV, execute buyback up to $500K from treasury.",
        trigger: "discount",
        threshold: 0.1,
        action: "execute_buyback",
        isActive: false,
    },
];

const actionLabels: Record<string, string> = {
    issue_shares: "Issue Shares",
    distribute_dividends: "Distribute Dividends",
    execute_buyback: "Execute Buyback",
    rebalance: "Rebalance",
};

const triggerLabels: Record<string, string> = {
    premium: "Price Premium",
    discount: "Price Discount",
    balance: "Balance Threshold",
    time: "Time-based",
};

export function RulesList({
    rules = defaultRules,
    onEdit,
    onDelete,
}: RulesListProps) {
    return (
        <div className="flex flex-col gap-4">
            {rules.map((rule) => (
                <div
                    key={rule.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-primary/30 transition-colors group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {rule.name}
                                </h3>
                                <Badge variant={rule.isActive ? "success" : "default"}>
                                    {rule.isActive ? "Active" : "Paused"}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                                {rule.description}
                            </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => onEdit?.(rule)}>
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete?.(rule)}>
                                <span className="material-symbols-outlined text-sm text-danger">
                                    delete
                                </span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                                filter_alt
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                Trigger:{" "}
                                <span className="text-slate-900 dark:text-white">
                                    {triggerLabels[rule.trigger] || rule.trigger}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                                trending_up
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                Threshold:{" "}
                                <span className="text-slate-900 dark:text-white">
                                    {rule.trigger === "balance"
                                        ? `$${(rule.threshold / 1000000).toFixed(1)}M`
                                        : `${(rule.threshold * 100).toFixed(0)}%`}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">
                                bolt
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                Action:{" "}
                                <span className="text-slate-900 dark:text-white">
                                    {actionLabels[rule.action] || rule.action}
                                </span>
                            </span>
                        </div>
                        {rule.lastTriggered && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="material-symbols-outlined text-slate-400 text-sm">
                                    schedule
                                </span>
                                <span className="text-xs text-slate-400">
                                    Last triggered:{" "}
                                    {new Date(rule.lastTriggered).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

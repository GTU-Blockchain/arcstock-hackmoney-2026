"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface OrderPanelProps {
    balance?: number;
    currentPrice?: number;
}

export function OrderPanel({
    balance = 24150.0,
    currentPrice = 142.68,
}: OrderPanelProps) {
    const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
    const [amount, setAmount] = useState("");

    const amountNum = parseFloat(amount) || 0;
    const estimatedShares = currentPrice > 0 ? amountNum / currentPrice : 0;

    const percentages = ["25%", "50%", "75%", "Max"];

    const handlePercentage = (pct: string) => {
        let multiplier = 0;
        switch (pct) {
            case "25%":
                multiplier = 0.25;
                break;
            case "50%":
                multiplier = 0.5;
                break;
            case "75%":
                multiplier = 0.75;
                break;
            case "Max":
                multiplier = 1;
                break;
        }
        setAmount((balance * multiplier).toFixed(2));
    };

    return (
        <div className="p-6">
            {/* Buy/Sell Toggle */}
            <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                    onClick={() => setOrderType("buy")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${orderType === "buy"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setOrderType("sell")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${orderType === "sell"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                >
                    Sell
                </button>
            </div>

            <div className="space-y-4">
                {/* Order Type */}
                <Select
                    label="Order Type"
                    options={[
                        { value: "market", label: "Market Order" },
                        { value: "limit", label: "Limit Order" },
                    ]}
                />

                {/* Amount */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        <span>Amount (USDC)</span>
                        <span>Balance: {balance.toLocaleString()}</span>
                    </div>
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        suffix="USDC"
                    />
                </div>

                {/* Percentage Buttons */}
                <div className="flex justify-between gap-2">
                    {percentages.map((pct) => (
                        <button
                            key={pct}
                            onClick={() => handlePercentage(pct)}
                            className="flex-1 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase"
                        >
                            {pct}
                        </button>
                    ))}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Est. Shares</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                            {estimatedShares.toFixed(2)} EQ
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Network Fee (Arc)</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                            0.00 USDC
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    className="w-full"
                    size="lg"
                    variant={orderType === "sell" ? "danger" : "primary"}
                >
                    Review {orderType === "buy" ? "Buy" : "Sell"} Order
                </Button>

                {/* Disclaimer */}
                <p className="text-[10px] text-center text-slate-400 px-4 leading-relaxed">
                    Assets will be instantly settled on Arc Stock and visible in your
                    portfolio across all supported chains.
                </p>
            </div>
        </div>
    );
}

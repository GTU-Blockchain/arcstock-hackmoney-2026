"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChainDetector } from "./ChainDetector";
import { Company } from "@/types";

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
    walletBalance?: number;
    detectedChain?: string;
    walletAddress?: string;
}

export function InvestmentModal({
    isOpen,
    onClose,
    company,
    walletBalance = 24500,
    detectedChain = "Ethereum Mainnet",
    walletAddress = "0x1234...5678",
}: InvestmentModalProps) {
    const [amount, setAmount] = useState("");

    if (!company) return null;

    const amountNum = parseFloat(amount) || 0;
    const estimatedShares = company.sharePrice > 0 ? amountNum / company.sharePrice : 0;

    const handleMaxAmount = () => {
        setAmount(walletBalance.toString());
    };

    const handleSubmit = () => {
        // Investment logic would go here
        console.log(`Investing ${amount} USDC in ${company.name}`);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Invest in ${company.name}`}
            subtitle="Equity Direct Issuance"
        >
            <div className="space-y-6">
                {/* Chain Detector */}
                <ChainDetector chain={detectedChain} address={walletAddress} />

                {/* Investment Input */}
                <div className="space-y-3">
                    <Input
                        label="Amount to Invest"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        suffix="USDC"
                        className="text-xl font-bold"
                    />
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">
                            Balance: {walletBalance.toLocaleString()}.00 USDC
                        </span>
                        <button
                            onClick={handleMaxAmount}
                            className="text-primary hover:underline"
                        >
                            Max Amount
                        </button>
                    </div>
                </div>

                {/* Asset Preview */}
                <div className="rounded-xl overflow-hidden h-24 relative bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-primary/20">
                            Asset Token: {company.ticker}
                        </span>
                    </div>
                </div>

                {/* No Bridge Notice */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex gap-3 border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-primary">
                        verified_user
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">
                            No bridge required.
                        </strong>{" "}
                        Direct settlement via Circle Gateway. Your assets will be delivered
                        to your wallet instantly upon confirmation.
                    </p>
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
            </div>

            <ModalFooter className="flex flex-col gap-3">
                <Button
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                    disabled={amountNum <= 0 || amountNum > walletBalance}
                >
                    Confirm Investment
                </Button>
                <p className="text-[10px] text-center text-slate-400 font-medium">
                    By clicking confirm, you agree to the Asset Purchase Agreement and
                    Terms of Service.
                </p>
            </ModalFooter>
        </Modal>
    );
}

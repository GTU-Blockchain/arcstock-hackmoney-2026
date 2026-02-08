"use client";

import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChainDetector } from "./ChainDetector";
import { Company } from "@/types";
import {
  createIntent,
  completeInvestment,
  getBalances,
  type IntentResponse,
} from "@/lib/api";
import { CHAIN_TO_DOMAIN } from "@/lib/wagmi";

const CHAIN_NAMES: Record<number, string> = {
  11155111: "Sepolia",
  43113: "Avalanche Fuji",
  84532: "Base Sepolia",
  5042002: "Arc Testnet",
};

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
  walletBalance: _walletBalance,
  detectedChain: _detectedChain,
  walletAddress: _walletAddress,
}: InvestmentModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "sign" | "complete">("input");
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const sourceDomain = chainId ? CHAIN_TO_DOMAIN[chainId] : undefined;
  const isSupportedChain = sourceDomain !== undefined;

  const { data: balancesData, isLoading: balancesLoading } = useQuery({
    queryKey: ["balances", address],
    queryFn: () => getBalances(address!),
    enabled: !!address && isOpen,
  });

  const balanceForChain = sourceDomain
    ? balancesData?.balances?.find((b) => b.domain === sourceDomain)?.balance ??
      "0"
    : "0";
  const walletBalance = parseFloat(balanceForChain) || 0;
  const chainName = chainId ? CHAIN_NAMES[chainId] ?? `Chain ${chainId}` : "—";

  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();

  if (!company) return null;

  const amountNum = parseFloat(amount) || 0;
  const estimatedShares =
    company.sharePrice > 0 ? amountNum / company.sharePrice : 0;
  const companyId = parseInt(company.id, 10);

  const handleMaxAmount = () => {
    setAmount(walletBalance.toString());
  };

  const handleSubmit = async () => {
    setError(null);
    if (!address || !isSupportedChain || amountNum <= 0 || amountNum > walletBalance) {
      return;
    }

    try {
      setStep("sign");
      const intentRes = await createIntent({
        companyId,
        amount: amountNum.toFixed(6),
        investorAddress: address,
        sourceDomain,
      });
      setIntent(intentRes);

      const burnIntent = intentRes.typedData.message as Record<string, unknown>;
      const signature = await signTypedDataAsync({
        domain: intentRes.typedData.domain,
        types: intentRes.typedData.types,
        primaryType: intentRes.typedData.primaryType,
        message: burnIntent,
      });

      setStep("complete");
      await completeInvestment({
        signedBurnIntent: {
          burnIntent,
          signature,
        },
        companyId,
        investorAddress: address,
        usdcAmount: amountNum.toFixed(6),
        shareAmount: estimatedShares.toFixed(6),
      });

      onClose();
      setAmount("");
      setIntent(null);
      setStep("input");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment failed");
      setStep("input");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invest in ${company.name}`}
      subtitle="Equity Direct Issuance"
    >
      <div className="space-y-6">
        {/* Chain / Wallet */}
        <ChainDetector
          chain={chainName}
          address={address ?? _walletAddress ?? "0x..."}
        />

        {!isConnected && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Connect your wallet to invest.
          </p>
        )}

        {isConnected && !isSupportedChain && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Switch to Base Sepolia, Sepolia, or Avalanche Fuji to use your USDC
            balance.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Investment Input */}
        {isConnected && (
          <div className="space-y-3">
            <Input
              label="Amount to Invest"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              suffix="USDC"
              className="text-xl font-bold"
              disabled={step !== "input"}
            />
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-500">
                Balance:{" "}
                {balancesLoading
                  ? "Loading..."
                  : `${walletBalance.toLocaleString()} USDC`}
              </span>
              <button
                onClick={handleMaxAmount}
                className="text-primary hover:underline disabled:opacity-50"
                disabled={step !== "input"}
              >
                Max Amount
              </button>
            </div>
          </div>
        )}

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
          disabled={
            !isConnected ||
            !isSupportedChain ||
            amountNum <= 0 ||
            amountNum > walletBalance ||
            isSigning ||
            step !== "input"
          }
        >
          {isSigning || step === "sign"
            ? "Confirm in Wallet..."
            : step === "complete"
              ? "Processing..."
              : "Confirm Investment"}
        </Button>
        <p className="text-[10px] text-center text-slate-400 font-medium">
          By clicking confirm, you agree to the Asset Purchase Agreement and
          Terms of Service.
        </p>
      </ModalFooter>
    </Modal>
  );
}

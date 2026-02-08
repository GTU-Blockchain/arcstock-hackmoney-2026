"use client";

import { useState, useEffect } from "react";
import { useAccount, useSignTypedData, useReadContract, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { parseUnits } from "viem";
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
import { CHAIN_TO_DOMAIN, CHAIN_USDC, GATEWAY_WALLET } from "@/lib/wagmi";

const GATEWAY_WALLET_ABI = [
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "depositor", type: "address" },
    ],
    name: "totalBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

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
  const [depositSuccess, setDepositSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) setDepositSuccess(false);
  }, [isOpen]);

  const { address, isConnected, chainId } = useAccount();
  const sourceDomain = chainId ? CHAIN_TO_DOMAIN[chainId] : undefined;
  const isSupportedChain = sourceDomain !== undefined;

  const { data: balancesData, isLoading: balancesLoading } = useQuery({
    queryKey: ["balances", address],
    queryFn: () => getBalances(address!),
    enabled: !!address && isOpen,
  });

  const usdcAddress = chainId ? CHAIN_USDC[chainId] : undefined;
  const { data: directBalance } = useReadContract({
    address: usdcAddress,
    chainId,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: gatewayOnChainBalance } = useReadContract({
    address: GATEWAY_WALLET,
    chainId,
    abi: GATEWAY_WALLET_ABI,
    functionName: "totalBalance",
    args: usdcAddress && address ? [usdcAddress, address] : undefined,
  });

  const balanceForChain = sourceDomain
    ? balancesData?.balances?.find((b) => b.domain === sourceDomain)?.balance ??
      "0"
    : "0";
  const gatewayApiBalance = parseFloat(balanceForChain) || 0;
  const gatewayOnChain = gatewayOnChainBalance ? Number(gatewayOnChainBalance) / 1e6 : 0;
  const pendingForDomain = (balancesData?.pendingDeposits ?? [])
    .filter((d) => d.domain === sourceDomain)
    .reduce((sum, d) => {
      const amt = parseFloat(d.amount);
      return sum + (amt > 1e6 ? amt / 1e6 : amt);
    }, 0);
  const gatewayDisplayBalance = Math.max(gatewayApiBalance, gatewayOnChain, pendingForDomain);
  const gatewayBalance = gatewayApiBalance;
  const directBalanceFormatted = directBalance
    ? Number(directBalance) / 1e6
    : 0;
  const chainName = chainId ? CHAIN_NAMES[chainId] ?? `Chain ${chainId}` : "—";
  const needsDeposit = gatewayBalance === 0 && directBalanceFormatted > 0;
  const investableBalance = gatewayBalance;

  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  const { writeContractAsync, isPending: isDepositing } = useWriteContract();
  const queryClient = useQueryClient();

  if (!company) return null;

  const amountNum = parseFloat(amount) || 0;
  const estimatedShares =
    company.sharePrice > 0 ? amountNum / company.sharePrice : 0;
  const companyId = parseInt(company.id, 10);

  const handleMaxAmount = () => {
    setAmount((investableBalance > 0 ? investableBalance : directBalanceFormatted).toString());
  };

  const handleDeposit = async () => {
    if (!usdcAddress || !address || directBalanceFormatted <= 0) return;
    setError(null);
    setDepositSuccess(false);
    const depositAmountWei = parseUnits(directBalanceFormatted.toFixed(6), 6);
    try {
      await writeContractAsync({
        address: usdcAddress,
        abi: [
          { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
        ] as const,
        functionName: "approve",
        args: [GATEWAY_WALLET, depositAmountWei],
      });
      await writeContractAsync({
        address: GATEWAY_WALLET,
        abi: [
          { inputs: [{ name: "token", type: "address" }, { name: "value", type: "uint256" }], name: "deposit", outputs: [], stateMutability: "nonpayable", type: "function" },
        ] as const,
        functionName: "deposit",
        args: [usdcAddress, depositAmountWei],
      });
      setDepositSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ["balances", address] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!address || !isSupportedChain || amountNum <= 0 || amountNum > investableBalance) {
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
      setDepositSuccess(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Investment failed";
      setError(
        msg.includes("Insufficient balance")
          ? "Gateway reports insufficient balance. Deposit your wallet USDC to Gateway first (Deposit button above), or wait 1–2 min after depositing for block confirmations."
          : msg
      );
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
            {chainId === 5042002
              ? "USDC on Arc Testnet cannot be used for investment. Switch to Base Sepolia, Sepolia, or Avalanche Fuji to invest."
              : "Switch to Base Sepolia, Sepolia, or Avalanche Fuji to use your USDC."
            }
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
                {balancesLoading && !directBalance
                  ? "Loading..."
                  : needsDeposit
                    ? `Wallet: ${directBalanceFormatted.toLocaleString()} USDC · Gateway: 0 USDC`
                    : gatewayDisplayBalance > investableBalance
                      ? `Balance: ${gatewayDisplayBalance.toLocaleString()} USDC (${investableBalance.toLocaleString()} available, rest pending)`
                      : `Balance on ${chainName}: ${investableBalance.toLocaleString()} USDC`}
              </span>
              <button
                onClick={handleMaxAmount}
                className="text-primary hover:underline disabled:opacity-50"
                disabled={step !== "input"}
              >
                Max Amount
              </button>
            </div>
            {depositSuccess && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
                <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                  Deposit successful!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  Gateway balance updates in <strong>10–20 minutes</strong> (block finality). Your funds are safe, just wait for confirmations.
                </p>
              </div>
            )}
            {needsDeposit && !depositSuccess && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  You have USDC in your wallet but it must be deposited into the Gateway before investing.
                </p>
                <Button
                  onClick={handleDeposit}
                  size="sm"
                  disabled={isDepositing || step !== "input"}
                >
                  {isDepositing ? "Depositing..." : "Deposit to Gateway"}
                </Button>
              </div>
            )}
            {isSupportedChain && !needsDeposit && directBalanceFormatted === 0 && gatewayBalance === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                You need USDC on <strong>{chainName}</strong>. Get testnet USDC from{" "}
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  faucet.circle.com
                </a>
              </p>
            )}
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
            amountNum > investableBalance ||
            isSigning ||
            isDepositing ||
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

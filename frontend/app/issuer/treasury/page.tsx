"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "viem";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getIssuerCompanyOrNull, getTreasuryBalance } from "@/lib/api";
import { ARC_CONTRACTS, ARC_CHAIN_ID } from "@/lib/contracts";

const USDC_DECIMALS = 6;

const treasuryAbi = [
  {
    inputs: [
      { name: "companyId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "companyId", type: "uint256" }],
    name: "getBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const erc20Abi = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function IssuerTreasuryPage() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState("");

  const { data: company, isLoading } = useQuery({
    queryKey: ["issuerCompany", address],
    queryFn: () => getIssuerCompanyOrNull(address!),
    enabled: !!address,
  });

  const { data: treasuryData, refetch: refetchTreasury } = useQuery({
    queryKey: ["treasury", company?.id],
    queryFn: () => getTreasuryBalance(company!.id),
    enabled: !!company?.id,
  });

  const { writeContract: approveUsdc, data: approveHash } = useWriteContract();
  const { writeContract: depositTreasury, data: depositHash } = useWriteContract();

  const { isLoading: isApprovePending } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isLoading: isDepositPending, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({
      hash: depositHash,
    });

  useEffect(() => {
    if (!isLoading && isConnected && address && !company) {
      router.replace("/issuer/create");
    }
  }, [isLoading, isConnected, address, company, router]);

  useEffect(() => {
    if (isDepositSuccess) {
      refetchTreasury();
      queryClient.invalidateQueries({ queryKey: ["treasury"] });
    }
  }, [isDepositSuccess, refetchTreasury, queryClient]);

  const isOnArc = chainId === ARC_CHAIN_ID;
  const treasuryBalance = treasuryData?.balance
    ? parseFloat(treasuryData.balance) / 1e6
    : 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950">
        <IssuerHeader />
        <main className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-400">Connect your wallet</p>
        </main>
      </div>
    );
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen bg-slate-950">
        <IssuerHeader />
        <main className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <IssuerHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">
              Treasury Management
            </h1>
            <p className="text-slate-400">
              Company treasury - USDC balance and deposit
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">{company.name}</p>
            <p className="text-slate-500 text-sm">{company.symbol}</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="mb-8 p-8 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl">
              account_balance
            </span>
            <span className="text-slate-400 text-sm">Treasury Balance</span>
          </div>
          <p className="text-white text-4xl font-black">
            ${treasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
            <span className="text-slate-500 text-lg font-normal">USDC</span>
          </p>
        </div>

        {/* Deposit Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-white text-xl font-bold mb-4">Deposit USDC</h2>
          <p className="text-slate-400 text-sm mb-6">
            Deposit your USDC on Arc Testnet to the company treasury. Approve
            first, then confirm deposit.
          </p>

          {!isOnArc && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-4">
              <span className="text-amber-400 text-sm">
                Switch to Arc Testnet to perform this action.
              </span>
              <Button
                size="sm"
                onClick={() => switchChainAsync?.({ chainId: ARC_CHAIN_ID })}
              >
                Switch to Arc
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Amount (USDC)"
                type="number"
                placeholder="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={!isOnArc}
              />
            </div>
            <Button
              onClick={() => {
                if (!company || !depositAmount || parseFloat(depositAmount) <= 0)
                  return;
                const amountWei = parseUnits(depositAmount, USDC_DECIMALS);
                approveUsdc({
                  address: ARC_CONTRACTS.usdc,
                  abi: erc20Abi,
                  functionName: "approve",
                  args: [ARC_CONTRACTS.treasury, amountWei],
                });
              }}
              disabled={
                !isOnArc ||
                !depositAmount ||
                parseFloat(depositAmount) <= 0 ||
                isApprovePending
              }
            >
              {isApprovePending ? "Approving..." : "1. Approve USDC"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!company || !depositAmount || parseFloat(depositAmount) <= 0)
                  return;
                const amountWei = parseUnits(depositAmount, USDC_DECIMALS);
                depositTreasury({
                  address: ARC_CONTRACTS.treasury,
                  abi: treasuryAbi,
                  functionName: "deposit",
                  args: [BigInt(company.id), amountWei],
                });
              }}
              disabled={
                !isOnArc ||
                !depositAmount ||
                parseFloat(depositAmount) <= 0 ||
                isDepositPending
              }
            >
              {isDepositPending ? "Depositing..." : "2. Deposit"}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-4">
          <span className="material-symbols-outlined text-primary text-2xl">
            info
          </span>
          <div>
            <h4 className="font-bold text-white mb-1">How It Works</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              First approve the Treasury to spend your USDC, then confirm
              deposit to add the amount to the company treasury. USDC must be
              in your wallet on Arc Testnet.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

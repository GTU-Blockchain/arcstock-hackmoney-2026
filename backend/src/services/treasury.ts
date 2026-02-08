/**
 * Treasury Service
 * Withdraw USDC from company vault. Only backend (owner) can call.
 */
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../config.js";
import { getShareholdersForCompany } from "./shareholders.js";

const arcChain = {
  id: config.arcChainId,
  name: "Arc Testnet",
  nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
  rpcUrls: { default: { http: [config.arcRpcUrl] } },
} as const;

const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(config.arcRpcUrl),
});

function getWalletClient() {
  if (!config.privateKey) {
    throw new Error("PRIVATE_KEY not set - cannot execute treasury withdrawals");
  }
  const account = privateKeyToAccount(config.privateKey);
  return createWalletClient({
    account,
    chain: arcChain,
    transport: http(config.arcRpcUrl),
  });
}

const treasuryAbi = [
  {
    inputs: [
      { name: "companyId", type: "uint256" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Withdraw USDC from company treasury. Only owner (backend) can call.
 * Caller must verify issuerAddress is companyWallet for companyId.
 */
export async function withdrawFromTreasury(params: {
  companyId: number;
  to: `0x${string}`;
  amount: string;
}): Promise<{ txHash: string }> {
  const { companyId, to, amount } = params;
  const amountWei = parseUnits(String(amount), 6); // USDC 6 decimals

  const wallet = getWalletClient();
  if (!wallet.account) throw new Error("No wallet account");

  const hash = await wallet.writeContract({
    address: config.treasury,
    abi: treasuryAbi,
    functionName: "withdraw",
    args: [BigInt(companyId), to, amountWei],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  return { txHash: hash };
}

export interface DividendDistribution {
  address: `0x${string}`;
  amount: string;
  amountFormatted: string;
  txHash: string;
}

/**
 * Distribute dividends proportionally to all shareholders.
 * Each shareholder receives: totalAmount * (theirBalance / totalSupply)
 */
export async function distributeDividends(params: {
  companyId: number;
  totalAmount: string;
}): Promise<{ distributions: DividendDistribution[] }> {
  const { companyId, totalAmount } = params;
  const totalAmountWei = parseUnits(String(totalAmount), 6); // USDC 6 decimals

  const shareholders = await getShareholdersForCompany(companyId);
  if (shareholders.length === 0) {
    throw new Error("Hissedar bulunamadı");
  }

  const totalSupplyWei = shareholders.reduce(
    (sum, s) => sum + BigInt(s.balance),
    0n
  );
  if (totalSupplyWei === 0n) {
    throw new Error("Toplam arz sıfır");
  }

  const wallet = getWalletClient();
  if (!wallet.account) throw new Error("No wallet account");

  const distributions: DividendDistribution[] = [];

  for (const shareholder of shareholders) {
    const balanceWei = BigInt(shareholder.balance);
    const amountWei =
      (totalAmountWei * balanceWei) / totalSupplyWei;
    if (amountWei === 0n) continue;

    const hash = await wallet.writeContract({
      address: config.treasury,
      abi: treasuryAbi,
      functionName: "withdraw",
      args: [BigInt(companyId), shareholder.address, amountWei],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    distributions.push({
      address: shareholder.address,
      amount: amountWei.toString(),
      amountFormatted: (Number(amountWei) / 1e6).toFixed(2),
      txHash: hash,
    });
  }

  return { distributions };
}

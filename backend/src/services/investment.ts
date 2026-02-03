/**
 * Investment Service
 * Orchestrates: Gateway settlement → Treasury.deposit → EquityRegistry.mintShares
 */
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../config.js";

// Arc Testnet chain
const arcChain = {
    id: config.arcChainId,
    name: "Arc Testnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
    rpcUrls: { default: { http: [config.arcRpcUrl] } },
} as const;

const publicClient = createPublicClient({
    chain: arcChain,
    transport: http(config.arcRpcUrl),
});

function getWalletClient() {
    if (!config.privateKey) {
        throw new Error(
            "PRIVATE_KEY not set - cannot execute settlement transactions",
        );
    }
    const account = privateKeyToAccount(config.privateKey);
    return createWalletClient({
        account,
        chain: arcChain,
        transport: http(config.arcRpcUrl),
    });
}

// Treasury ABI (deposit, getBalance)
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

// USDC ERC20 (approve)
const usdcAbi = [
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

// EquityRegistry ABI (mintShares)
const registryAbi = [
    {
        inputs: [
            { name: "companyId", type: "uint256" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "mintShares",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

export interface SettlementParams {
    companyId: number;
    investorAddress: `0x${string}`;
    usdcAmount: string; // human-readable, e.g. "100"
    shareAmount: string; // human-readable, e.g. "10" (shares to mint)
}

/**
 * Execute on-chain settlement after USDC is received.
 * 1. Treasury.deposit(companyId, amount) - caller must have approved Treasury to spend USDC
 * 2. EquityRegistry.mintShares(companyId, investor, shareAmount)
 *
 * Note: In full flow, USDC comes via Circle Gateway to a designated address.
 * The backend (or a relayer) would need to hold/forward that USDC to Treasury.
 * For MVP, we assume USDC is already available or handled off-chain.
 */
export async function executeSettlement(
    params: SettlementParams,
): Promise<{ txHash: string }> {
    const { companyId, investorAddress, usdcAmount, shareAmount } = params;

    const usdcAmountWei = parseUnits(usdcAmount, 6); // USDC 6 decimals
    const shareAmountWei = parseUnits(shareAmount, 18); // EquityToken 18 decimals

    const wallet = getWalletClient();
    if (!wallet.account) throw new Error("No wallet account");

    // Step 0: Approve Treasury to spend USDC (required for deposit's transferFrom)
    await wallet.writeContract({
        address: config.usdc,
        abi: usdcAbi,
        functionName: "approve",
        args: [config.treasury, usdcAmountWei],
    });

    // Step 1: Treasury.deposit - pulls USDC from msg.sender
    const depositHash = await wallet.writeContract({
        address: config.treasury,
        abi: treasuryAbi,
        functionName: "deposit",
        args: [BigInt(companyId), usdcAmountWei],
    });

    await publicClient.waitForTransactionReceipt({ hash: depositHash });

    // Step 2: Mint shares to investor
    const mintHash = await wallet.writeContract({
        address: config.equityRegistry,
        abi: registryAbi,
        functionName: "mintShares",
        args: [BigInt(companyId), investorAddress, shareAmountWei],
    });

    await publicClient.waitForTransactionReceipt({ hash: mintHash });

    return { txHash: mintHash };
}

export async function getCompanyTreasuryBalance(
    companyId: number,
): Promise<bigint> {
    return publicClient.readContract({
        address: config.treasury,
        abi: treasuryAbi,
        functionName: "getBalance",
        args: [BigInt(companyId)],
    });
}

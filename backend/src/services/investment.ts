/**
 * Investment Service
 * Orchestrates: Gateway settlement → Treasury.deposit → EquityRegistry.transferFromCompany
 * Shares are transferred from company wallet (pool) to investor. Company must have minted
 * shares to pool and approved the registry via EquityToken.approve(registry, amount).
 */
import { createPublicClient, createWalletClient, http, maxUint256, parseUnits } from "viem";
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

// USDC ERC20 (approve, balanceOf, allowance)
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
    {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

// EquityRegistry ABI (companies, transferFromCompany, authorizedMinters, owner)
const registryAbi = [
    {
        inputs: [{ name: "", type: "uint256" }],
        name: "companies",
        outputs: [
            { name: "id", type: "uint256" },
            { name: "name", type: "string" },
            { name: "symbol", type: "string" },
            { name: "metadataUri", type: "string" },
            { name: "equityToken", type: "address" },
            { name: "companyWallet", type: "address" },
            { name: "active", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "", type: "address" }],
        name: "authorizedMinters",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    { inputs: [], name: "owner", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
    {
        inputs: [
            { name: "companyId_", type: "uint256" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "mintShares",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "companyId_", type: "uint256" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "transferFromCompany",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

const erc20Abi = [
    { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "transferFrom", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const;

export interface SettlementParams {
    companyId: number;
    investorAddress: `0x${string}`;
    usdcAmount: string; // human-readable, e.g. "100"
    shareAmount: string; // human-readable, e.g. "10" (shares to mint)
    /** Optional: actual USDC received after Gateway fees (in wei, 6 decimals) */
    receivedAmountWei?: bigint;
}

/**
 * Check that company pool has enough shares and approval for settlement.
 * Backend calls EquityToken.transferFrom directly, so we need allowance(companyWallet, backend).
 */
export async function checkPoolForSettlement(params: {
    companyId: number;
    shareAmount: string;
}): Promise<void> {
    const { companyId, shareAmount } = params;
    const shareAmountWei = parseUnits(shareAmount, 18);
    const backendWallet = config.backendWallet;
    if (!backendWallet) throw new Error("Backend wallet not configured");

    const [, , , , equityToken, companyWallet] = await publicClient.readContract({
        address: config.equityRegistry,
        abi: registryAbi,
        functionName: "companies",
        args: [BigInt(companyId)],
    });
    const [poolBalance, poolAllowance] = await Promise.all([
        publicClient.readContract({
            address: equityToken as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [companyWallet as `0x${string}`],
        }),
        publicClient.readContract({
            address: equityToken as `0x${string}`,
            abi: erc20Abi,
            functionName: "allowance",
            args: [companyWallet as `0x${string}`, backendWallet],
        }),
    ]);
    if (poolBalance < shareAmountWei) {
        throw new Error(
            `Company pool has insufficient shares. ` +
            "The issuer must mint more shares to the pool (Issuer → Issue → Add to Company Pool)."
        );
    }
    if (poolAllowance < shareAmountWei) {
        throw new Error(
            "Company pool has not approved the backend for sales. " +
            "The issuer must approve the backend (Issuer → Issue → Approve Backend for Sales) before investors can buy."
        );
    }
}

/**
 * Execute on-chain settlement after USDC is received.
 * 1. Treasury.deposit(companyId, amount) - caller must have approved Treasury to spend USDC
 * 2. EquityRegistry.transferFromCompany(companyId, investor, shareAmount)
 *
 * Note: In full flow, USDC comes via Circle Gateway to a designated address.
 * The backend (or a relayer) would need to hold/forward that USDC to Treasury.
 * For MVP, we assume USDC is already available or handled off-chain.
 */
export async function executeSettlement(
    params: SettlementParams,
): Promise<{ txHash: string }> {
    const { companyId, investorAddress, usdcAmount, shareAmount, receivedAmountWei } = params;

    const usdcAmountWei = parseUnits(usdcAmount, 6); // USDC 6 decimals
    const shareAmountWei = parseUnits(shareAmount, 18); // EquityToken 18 decimals

    const wallet = getWalletClient();
    if (!wallet.account) throw new Error("No wallet account");

    // Gateway may deduct fees; use actual balance and/or receivedAmountWei
    const backendBalance = await publicClient.readContract({
        address: config.usdc,
        abi: usdcAbi,
        functionName: "balanceOf",
        args: [wallet.account.address],
    });

    const maxByFees = receivedAmountWei ?? usdcAmountWei;
    const depositAmount = backendBalance < maxByFees ? backendBalance : maxByFees;
    console.log("[Settlement] backend=%s balance=%s depositAmount=%s", wallet.account.address, backendBalance.toString(), depositAmount.toString());
    if (depositAmount === 0n) {
        console.error(
            "[Settlement] Backend USDC balance=0, receivedAmountWei=%s. gatewayMint may not have credited backend.",
            receivedAmountWei?.toString() ?? "N/A",
        );
        throw new Error(
            "Backend has no USDC after Gateway mint. Check GET /api/invest/debug/balance - destinationRecipient in burn intent must match backend wallet."
        );
    }

    // Step 0: Approve Treasury to spend USDC (required for deposit's transferFrom)
    // USDC may require approve(0) before changing; use maxUint256 to avoid allowance edge cases
    const currentAllowance = await publicClient.readContract({
        address: config.usdc,
        abi: usdcAbi,
        functionName: "allowance",
        args: [wallet.account.address, config.treasury],
    });
    console.log("[Settlement] allowance(backend,Treasury)=%s", currentAllowance.toString());
    if (currentAllowance < depositAmount) {
        const approveHash = await wallet.writeContract({
            address: config.usdc,
            abi: usdcAbi,
            functionName: "approve",
            args: [config.treasury, maxUint256],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
    }

    // Step 1: Treasury.deposit - pulls USDC from msg.sender
    const depositHash = await wallet.writeContract({
        address: config.treasury,
        abi: treasuryAbi,
        functionName: "deposit",
        args: [BigInt(companyId), depositAmount],
    });

    await publicClient.waitForTransactionReceipt({ hash: depositHash });

    // Step 2: Transfer shares from company pool to investor.
    // Call EquityToken.transferFrom directly (Registry's transferFromCompany reverts on Arc).
    const [, , , , equityToken, companyWallet] = await publicClient.readContract({
        address: config.equityRegistry,
        abi: registryAbi,
        functionName: "companies",
        args: [BigInt(companyId)],
    });
    const [poolBalance, poolAllowance] = await Promise.all([
        publicClient.readContract({
            address: equityToken as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [companyWallet as `0x${string}`],
        }),
        publicClient.readContract({
            address: equityToken as `0x${string}`,
            abi: erc20Abi,
            functionName: "allowance",
            args: [companyWallet as `0x${string}`, wallet.account.address],
        }),
    ]);
    const transferAmount = [shareAmountWei, poolBalance, poolAllowance].reduce((a, b) => (a < b ? a : b));
    if (transferAmount === 0n) {
        throw new Error(
            "Company pool has no shares or backend approval. Issuer must add shares and approve backend (Approve Backend for Sales)."
        );
    }
    console.log("[Settlement] pool balance=%s allowance=%s -> transferAmount=%s", poolBalance.toString(), poolAllowance.toString(), transferAmount.toString());
    const transferHash = await wallet.writeContract({
        address: equityToken as `0x${string}`,
        abi: erc20Abi,
        functionName: "transferFrom",
        args: [companyWallet as `0x${string}`, investorAddress, transferAmount],
    });

    await publicClient.waitForTransactionReceipt({ hash: transferHash });

    return { txHash: transferHash };
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

import { Router, Request, Response } from "express";
import {
    executeSettlement,
    getCompanyTreasuryBalance,
} from "../services/investment.js";
import { completeGatewayTransfer } from "../services/gatewayTransfer.js";
import { createBurnIntent } from "../gateway/burnIntent.js";
import { getBalances, getDeposits } from "../gateway/client.js";
import { config } from "../config.js";
import { parseUnits } from "viem";

export const investRoutes = Router();

/**
 * POST /api/invest/intent
 * Create investment intent - returns burn intent typed data for user to sign.
 * User must have Gateway balance on source chain.
 */
investRoutes.post("/intent", async (req: Request, res: Response) => {
    try {
        const { companyId, amount, investorAddress, sourceDomain } = req.body;

        if (!companyId || !amount || !investorAddress) {
            return res.status(400).json({
                error: "Missing companyId, amount, or investorAddress",
            });
        }

        const domain = sourceDomain ?? 6; // Default Base Sepolia
        const backendWallet = config.backendWallet;
        if (!backendWallet) {
            return res
                .status(500)
                .json({ error: "Backend wallet not configured" });
        }

        const amountWei = parseUnits(String(amount), 6); // USDC 6 decimals
        const typedData = createBurnIntent({
            sourceDomain: Number(domain),
            sourceDepositor: investorAddress,
            destinationRecipient: backendWallet,
            amountWei,
        });

        return res.json({
            intentId: `intent-${Date.now()}`,
            companyId,
            amount,
            investorAddress,
            sourceDomain: domain,
            // Frontend uses this for signTypedData
            typedData: {
                domain: typedData.domain,
                types: typedData.types,
                primaryType: typedData.primaryType,
                message: JSON.parse(
                    JSON.stringify(typedData.message, (_, v) =>
                        typeof v === "bigint" ? v.toString() : v,
                    ),
                ),
            },
        });
    } catch (err) {
        console.error("Intent error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

/**
 * POST /api/invest/complete
 * Complete Gateway transfer + settlement.
 * Body: { signedBurnIntent: { burnIntent, signature }, companyId, investorAddress, usdcAmount, shareAmount }
 */
investRoutes.post("/complete", async (req: Request, res: Response) => {
    try {
        const {
            signedBurnIntent,
            companyId,
            investorAddress,
            usdcAmount,
            shareAmount,
        } = req.body;

        if (
            !signedBurnIntent?.burnIntent ||
            !signedBurnIntent?.signature ||
            !companyId ||
            !investorAddress ||
            !usdcAmount ||
            !shareAmount
        ) {
            return res.status(400).json({
                error: "Missing signedBurnIntent, companyId, investorAddress, usdcAmount, or shareAmount",
            });
        }

        const result = await completeGatewayTransfer({
            signedBurnIntent,
            companyId,
            investorAddress: investorAddress as `0x${string}`,
            usdcAmount: String(usdcAmount),
            shareAmount: String(shareAmount),
        });

        return res.json({
            success: true,
            transferId: result.transferId,
            mintTxHash: result.mintTxHash,
            settlementTxHash: result.settlementTxHash,
        });
    } catch (err) {
        console.error("Complete error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

/**
 * POST /api/invest/settlement
 * Direct settlement (no Gateway) - when USDC already in backend wallet.
 */
investRoutes.post("/settlement", async (req: Request, res: Response) => {
    try {
        const { companyId, investorAddress, usdcAmount, shareAmount } =
            req.body;

        if (!companyId || !investorAddress || !usdcAmount || !shareAmount) {
            return res.status(400).json({
                error: "Missing companyId, investorAddress, usdcAmount, or shareAmount",
            });
        }

        const result = await executeSettlement({
            companyId,
            investorAddress: investorAddress as `0x${string}`,
            usdcAmount,
            shareAmount,
        });

        return res.json({ success: true, txHash: result.txHash });
    } catch (err) {
        console.error("Settlement error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

/**
 * GET /api/invest/backend-address
 * Backend wallet address - issuer must approve this for pool sales (EquityToken.approve(backend, amount))
 */
investRoutes.get("/backend-address", (_req: Request, res: Response) => {
    const backendWallet = config.backendWallet;
    if (!backendWallet) {
        return res.status(500).json({ error: "Backend wallet not configured" });
    }
    return res.json({ backendWallet });
});

/**
 * GET /api/invest/balances/:address
 * Get Gateway USDC balance for an address
 */
investRoutes.get("/balances/:address", async (req: Request, res: Response) => {
    try {
        const { address } = req.params;
        const domains = [0, 1, 6, 26]; // Sepolia, Avalanche, Base, Arc
        const [balancesResult, depositsResult] = await Promise.all([
            getBalances(address, domains),
            getDeposits(address, domains).catch(() => ({ token: "USDC", deposits: [] })),
        ]);
        return res.json({
            ...balancesResult,
            pendingDeposits: depositsResult.deposits,
        });
    } catch (err) {
        console.error("Balances error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

/**
 * GET /api/invest/treasury/:companyId
 */
investRoutes.get(
    "/treasury/:companyId",
    async (req: Request, res: Response) => {
        try {
            const companyId = parseInt(req.params.companyId, 10);
            if (isNaN(companyId)) {
                return res.status(400).json({ error: "Invalid companyId" });
            }

            const balance = await getCompanyTreasuryBalance(companyId);
            return res.json({ companyId, balance: balance.toString() });
        } catch (err) {
            console.error("Treasury balance error:", err);
            return res.status(500).json({ error: String(err) });
        }
    },
);

/**
 * GET /api/invest/debug/balance
 * Debug: backend wallet USDC balance (ERC-20 balanceOf) for diagnosing TransferFailed
 */
investRoutes.get("/debug/balance", async (_req: Request, res: Response) => {
    try {
        const { createPublicClient, http } = await import("viem");
        const { config } = await import("../config.js");
        const arcChain = {
            id: config.arcChainId,
            name: "Arc Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
            rpcUrls: { default: { http: [config.arcRpcUrl] } },
        } as const;
        const client = createPublicClient({
            chain: arcChain,
            transport: http(config.arcRpcUrl),
        });
        const backendWallet = config.backendWallet;
        if (!backendWallet) {
            return res.status(500).json({ error: "Backend wallet not configured" });
        }
        const usdcAbi = [
            { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
        ] as const;
        const balance = await client.readContract({
            address: config.usdc,
            abi: usdcAbi,
            functionName: "balanceOf",
            args: [backendWallet],
        });
        // Also check Treasury's USDC address and allowance
        const pk = process.env.PRIVATE_KEY as `0x${string}` | undefined;
        const allowance = pk
            ? await client.readContract({
                address: config.usdc,
                abi: [{ inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" }],
                functionName: "allowance",
                args: [backendWallet, config.treasury],
            })
            : null;
        const treasuryUsdc = await client.readContract({
            address: config.treasury,
            abi: [{ inputs: [], name: "usdc", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" }],
            functionName: "usdc",
        });
        return res.json({
            backendWallet,
            usdcAddress: config.usdc,
            treasuryUsdcAddress: treasuryUsdc,
            usdcMatch: treasuryUsdc.toLowerCase() === config.usdc.toLowerCase(),
            balanceWei: balance.toString(),
            balanceHuman: (Number(balance) / 1e6).toFixed(6),
            allowanceToTreasury: allowance?.toString() ?? "N/A",
        });
    } catch (err) {
        console.error("Debug balance error:", err);
        return res.status(500).json({ error: String(err) });
    }
});

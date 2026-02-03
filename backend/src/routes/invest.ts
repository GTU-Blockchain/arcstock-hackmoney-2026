import { Router, Request, Response } from "express";
import {
    executeSettlement,
    getCompanyTreasuryBalance,
} from "../services/investment.js";
import { completeGatewayTransfer } from "../services/gatewayTransfer.js";
import { createBurnIntent } from "../gateway/burnIntent.js";
import { getBalances } from "../gateway/client.js";
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
 * GET /api/invest/balances/:address
 * Get Gateway USDC balance for an address
 */
investRoutes.get("/balances/:address", async (req: Request, res: Response) => {
    try {
        const { address } = req.params;
        const domains = [0, 1, 6, 26]; // Sepolia, Avalanche, Base, Arc
        const result = await getBalances(address, domains);
        return res.json(result);
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

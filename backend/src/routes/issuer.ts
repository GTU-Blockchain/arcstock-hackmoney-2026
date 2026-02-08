import { Router, Request, Response } from "express";
import {
  getCompanyByWallet,
  getCompanyWithDetailsByWallet,
  registerCompany,
  cancelShares,
  mintShares,
  setAuthorizedMinter,
} from "../services/registry.js";
import { getShareholdersForCompany } from "../services/shareholders.js";
import {
  withdrawFromTreasury,
  distributeDividends,
} from "../services/treasury.js";
import { config } from "../config.js";

export const issuerRoutes = Router();

/**
 * POST /api/issuer/authorize-settlement
 * Authorize the backend wallet to call transferFromCompany (investment settlement).
 * Only registry owner can call. Run once after deployment if backend != owner.
 */
issuerRoutes.post("/authorize-settlement", async (_req: Request, res: Response) => {
  try {
    const backendWallet = config.backendWallet;
    if (!backendWallet) {
      return res.status(500).json({ error: "Backend wallet not configured" });
    }
    const result = await setAuthorizedMinter(backendWallet, true);
    return res.json({
      success: true,
      authorized: backendWallet,
      txHash: result.txHash,
    });
  } catch (err) {
    console.error("Authorize settlement error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to authorize. Ensure caller is registry owner.",
    });
  }
});

/**
 * GET /api/issuer/company/:wallet
 * Returns the company for this wallet if one exists (with treasuryBalance, totalSupply).
 * Returns 404 if no company is registered for this wallet.
 */
issuerRoutes.get("/company/:wallet", async (req: Request, res: Response) => {
  try {
    const wallet = req.params.wallet as `0x${string}`;
    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const company = await getCompanyWithDetailsByWallet(wallet);
    if (!company) {
      return res.status(404).json({ error: "No company found for this wallet" });
    }

    return res.json(company);
  } catch (err) {
    console.error("Get company error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/issuer/register
 * Register a new company. Body: { name, symbol, metadataUri, companyWallet }
 * Only registry owner can call - backend uses PRIVATE_KEY.
 */
issuerRoutes.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, symbol, metadataUri, companyWallet } = req.body;

    if (!name || !symbol || !companyWallet) {
      return res.status(400).json({
        error: "Missing name, symbol, or companyWallet",
      });
    }

    const wallet = companyWallet as `0x${string}`;
    if (!wallet.startsWith("0x") || wallet.length !== 42) {
      return res.status(400).json({ error: "Invalid companyWallet address" });
    }

    const result = await registerCompany({
      name: String(name),
      symbol: String(symbol),
      metadataUri: metadataUri ? String(metadataUri) : "",
      companyWallet: wallet,
    });

    return res.json({
      success: true,
      companyId: result.companyId,
      equityToken: result.equityToken,
    });
  } catch (err) {
    console.error("Register company error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/issuer/buyback
 * Cancel shares (buyback). Body: { companyId, from, amount, issuerAddress }
 * Backend verifies issuerAddress is companyWallet for companyId.
 */
issuerRoutes.post("/buyback", async (req: Request, res: Response) => {
  try {
    const { companyId, from, amount, issuerAddress } = req.body;

    if (!companyId || !from || !amount || !issuerAddress) {
      return res.status(400).json({
        error: "Missing companyId, from, amount, or issuerAddress",
      });
    }

    const issuer = issuerAddress as `0x${string}`;
    if (!issuer.startsWith("0x") || issuer.length !== 42) {
      return res.status(400).json({ error: "Invalid issuerAddress" });
    }

    const shareholder = from as `0x${string}`;
    if (!shareholder.startsWith("0x") || shareholder.length !== 42) {
      return res.status(400).json({ error: "Invalid from address" });
    }

    const company = await getCompanyByWallet(issuer);
    if (!company || company.id !== Number(companyId)) {
      return res.status(403).json({
        error: "Only the company wallet can request buyback",
      });
    }

    const result = await cancelShares({
      companyId: Number(companyId),
      from: shareholder,
      amount: String(amount),
    });

    return res.json({
      success: true,
      txHash: result.txHash,
    });
  } catch (err) {
    console.error("Buyback error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/issuer/mint
 * Issue new shares. Body: { companyId, to, amount, issuerAddress }
 */
issuerRoutes.post("/mint", async (req: Request, res: Response) => {
  try {
    const { companyId, to, amount, issuerAddress } = req.body;

    if (!companyId || !to || !amount || !issuerAddress) {
      return res.status(400).json({
        error: "Missing companyId, to, amount, or issuerAddress",
      });
    }

    const issuer = issuerAddress as `0x${string}`;
    if (!issuer.startsWith("0x") || issuer.length !== 42) {
      return res.status(400).json({ error: "Invalid issuerAddress" });
    }

    const recipient = to as `0x${string}`;
    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      return res.status(400).json({ error: "Invalid recipient address" });
    }

    const company = await getCompanyByWallet(issuer);
    if (!company || company.id !== Number(companyId)) {
      return res.status(403).json({
        error: "Only the company wallet can issue shares",
      });
    }

    const result = await mintShares({
      companyId: Number(companyId),
      to: recipient,
      amount: String(amount),
    });

    return res.json({
      success: true,
      txHash: result.txHash,
    });
  } catch (err) {
    console.error("Mint error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/issuer/shareholders/:companyId
 * Returns shareholders for company. Only if issuerAddress (query) is companyWallet.
 */
issuerRoutes.get(
  "/shareholders/:companyId",
  async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      const issuerAddress = req.query.issuerAddress as string;
      if (!companyId || isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid companyId" });
      }
      if (!issuerAddress?.startsWith("0x") || issuerAddress.length !== 42) {
        return res.status(400).json({ error: "Invalid issuerAddress" });
      }

      const company = await getCompanyByWallet(issuerAddress as `0x${string}`);
      if (!company || company.id !== companyId) {
        return res.status(403).json({
          error: "Only the company wallet can view shareholders",
        });
      }

      const shareholders = await getShareholdersForCompany(companyId);
      return res.json(shareholders);
    } catch (err) {
      console.error("Get shareholders error:", err);
      return res.status(500).json({ error: String(err) });
    }
  }
);

/**
 * POST /api/issuer/dividends
 * Distribute USDC proportionally to all shareholders. Body: { companyId, amount, issuerAddress }
 */
issuerRoutes.post("/dividends", async (req: Request, res: Response) => {
  try {
    const { companyId, amount, issuerAddress } = req.body;

    if (!companyId || !amount || !issuerAddress) {
      return res.status(400).json({
        error: "Missing companyId, amount, or issuerAddress",
      });
    }

    const issuer = issuerAddress as `0x${string}`;
    if (!issuer.startsWith("0x") || issuer.length !== 42) {
      return res.status(400).json({ error: "Invalid issuerAddress" });
    }

    const company = await getCompanyByWallet(issuer);
    if (!company || company.id !== Number(companyId)) {
      return res.status(403).json({
        error: "Only the company wallet can distribute dividends",
      });
    }

    const result = await distributeDividends({
      companyId: Number(companyId),
      totalAmount: String(amount),
    });

    return res.json({
      success: true,
      distributions: result.distributions,
    });
  } catch (err) {
    console.error("Dividends error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/issuer/withdraw
 * Withdraw USDC from company treasury (dividends, etc.). Body: { companyId, to, amount, issuerAddress }
 * Backend verifies issuerAddress is companyWallet for companyId.
 */
issuerRoutes.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const { companyId, to, amount, issuerAddress } = req.body;

    if (!companyId || !to || !amount || !issuerAddress) {
      return res.status(400).json({
        error: "Missing companyId, to, amount, or issuerAddress",
      });
    }

    const issuer = issuerAddress as `0x${string}`;
    if (!issuer.startsWith("0x") || issuer.length !== 42) {
      return res.status(400).json({ error: "Invalid issuerAddress" });
    }

    const recipient = to as `0x${string}`;
    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      return res.status(400).json({ error: "Invalid recipient address" });
    }

    const company = await getCompanyByWallet(issuer);
    if (!company || company.id !== Number(companyId)) {
      return res.status(403).json({
        error: "Only the company wallet can request withdrawal",
      });
    }

    const result = await withdrawFromTreasury({
      companyId: Number(companyId),
      to: recipient,
      amount: String(amount),
    });

    return res.json({
      success: true,
      txHash: result.txHash,
    });
  } catch (err) {
    console.error("Withdraw error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

import { Router, Request, Response } from "express";
import { getInvestorPortfolio } from "../services/portfolio.js";

export const investorRoutes = Router();

/**
 * GET /api/investor/portfolio/:wallet
 * Returns investor's equity holdings (shares in each company).
 */
investorRoutes.get("/portfolio/:wallet", async (req: Request, res: Response) => {
  try {
    const wallet = req.params.wallet as `0x${string}`;
    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const portfolio = await getInvestorPortfolio(wallet);
    return res.json(portfolio);
  } catch (err) {
    console.error("Get portfolio error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

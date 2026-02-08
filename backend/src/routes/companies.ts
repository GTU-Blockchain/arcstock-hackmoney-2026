import { Router, Request, Response } from "express";
import { getAllCompaniesWithDetails } from "../services/registry.js";

export const companiesRoutes = Router();

/**
 * GET /api/companies
 * Returns all active companies with treasury & totalSupply (for investor marketplace).
 */
companiesRoutes.get("/", async (_req: Request, res: Response) => {
  try {
    const companies = await getAllCompaniesWithDetails();
    return res.json(companies);
  } catch (err) {
    console.error("Get companies error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

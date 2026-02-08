import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { investRoutes } from "./routes/invest.js";
import { issuerRoutes } from "./routes/issuer.js";
import { companiesRoutes } from "./routes/companies.js";
import { investorRoutes } from "./routes/investor.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "arcstock-backend" });
});

app.use("/api/invest", investRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/investor", investorRoutes);

app.listen(config.port, () => {
    console.log(`ArcStock Backend running on port ${config.port}`);
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { investRoutes } from "./routes/invest.js";
import { agentRoutes } from "./routes/agent.js";
import { oracleRoutes } from "./routes/oracle.js";
import { startAgentScheduler } from "./scheduler/agentScheduler.js";
import AgentExecutionService from "./services/agentExecutionService.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "arcstock-backend",
        timestamp: new Date().toISOString(),
        agentScheduler: "enabled"
    });
});

// API Routes
app.use("/api/invest", investRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/oracle", oracleRoutes);

// Start Agent Scheduler
const executionService = new AgentExecutionService();
startAgentScheduler(executionService);

app.listen(config.port, () => {
    console.log(`ArcStock Backend running on port ${config.port}`);
    console.log(`Agent scheduler enabled: ${config.agentSchedulerInterval}s interval`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

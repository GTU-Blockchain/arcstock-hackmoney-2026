import { Router } from 'express';
import { db } from '../database/client.js';
import AgentExecutionService from '../services/agentExecutionService.js';

export const agentRoutes = Router();

/**
 * POST /api/agent/config
 * Enable/configure agent for a company (only company wallet)
 * Body: { companyId, isEnabled, riskTolerance, maxMintPerDay, maxDividendPerDay, walletAddress }
 */
agentRoutes.post('/config', async (req, res) => {
    try {
        const { companyId, isEnabled, riskTolerance, maxMintPerDay, maxDividendPerDay, walletAddress } = req.body;

        // Validation
        if (!companyId || walletAddress === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // TODO: Verify walletAddress owns this company (signature verification)
        // For now, we'll trust the frontend to send the correct wallet

        const result = await db.query(
            `INSERT INTO agent_config (company_id, is_enabled, risk_tolerance, max_mint_per_day, max_dividend_per_day, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (company_id) DO UPDATE SET
                is_enabled = $2,
                risk_tolerance = $3,
                max_mint_per_day = $4,
                max_dividend_per_day = $5,
                updated_at = NOW()
             RETURNING *`,
            [companyId, isEnabled ?? true, riskTolerance ?? 'medium', maxMintPerDay ?? 10000, maxDividendPerDay ?? 10000, walletAddress]
        );

        res.json({ success: true, config: result.rows[0] });
    } catch (error) {
        console.error('[Agent API] Error updating config:', error);
        res.status(500).json({ error: 'Failed to update agent configuration' });
    }
});

/**
 * GET /api/agent/config/:companyId
 * Get agent configuration for a company
 */
agentRoutes.get('/config/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;

        const result = await db.query(
            `SELECT * FROM agent_config WHERE company_id = $1`,
            [companyId]
        );

        if (result.rows.length === 0) {
            return res.json({ is_enabled: false });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('[Agent API] Error fetching config:', error);
        res.status(500).json({ error: 'Failed to fetch agent configuration' });
    }
});

/**
 * GET /api/agent/logs/:companyId?limit=50
 * Get execution logs for a company
 */
agentRoutes.get('/logs/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const result = await db.query(
            `SELECT * FROM agent_logs
             WHERE company_id = $1
             ORDER BY timestamp DESC
             LIMIT $2`,
            [companyId, limit]
        );

        res.json({ logs: result.rows });
    } catch (error) {
        console.error('[Agent API] Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch agent logs' });
    }
});

/**
 * GET /api/agent/logs
 * Get all execution logs (optional: filter by status, decision_type)
 */
agentRoutes.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const status = req.query.status as string;
        const decisionType = req.query.decision_type as string;

        let query = 'SELECT * FROM agent_logs WHERE 1=1';
        const params: any[] = [];

        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }

        if (decisionType) {
            params.push(decisionType);
            query += ` AND decision_type = $${params.length}`;
        }

        params.push(limit);
        query += ` ORDER BY timestamp DESC LIMIT $${params.length}`;

        const result = await db.query(query, params);

        res.json({ logs: result.rows });
    } catch (error) {
        console.error('[Agent API] Error fetching all logs:', error);
        res.status(500).json({ error: 'Failed to fetch agent logs' });
    }
});

/**
 * GET /api/agent/insights/:companyId
 * Get latest Gemini insights for a company
 */
agentRoutes.get('/insights/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await db.query(
            `SELECT * FROM gemini_insights
             WHERE company_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
             ORDER BY created_at DESC
             LIMIT $2`,
            [companyId, limit]
        );

        res.json({ insights: result.rows });
    } catch (error) {
        console.error('[Agent API] Error fetching insights:', error);
        res.status(500).json({ error: 'Failed to fetch Gemini insights' });
    }
});

/**
 * POST /api/agent/execute/:companyId
 * Manually trigger agent evaluation (for testing)
 */
agentRoutes.post('/execute/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const executionService = new AgentExecutionService();

        // Run evaluation asynchronously
        executionService.evaluateCompany(parseInt(companyId))
            .catch(error => {
                console.error('[Agent API] Error in manual execution:', error);
            });

        res.json({
            success: true,
            message: 'Evaluation triggered',
            companyId: parseInt(companyId)
        });
    } catch (error) {
        console.error('[Agent API] Error triggering execution:', error);
        res.status(500).json({ error: 'Failed to trigger agent execution' });
    }
});

/**
 * GET /api/agent/stats
 * Get overall agent statistics
 */
agentRoutes.get('/stats', async (req, res) => {
    try {
        const enabledAgentsResult = await db.query(
            `SELECT COUNT(*) as count FROM agent_config WHERE is_enabled = true`
        );

        const totalActionsResult = await db.query(
            `SELECT COUNT(*) as count FROM agent_logs WHERE status = 'success' AND decision_type != 'hold'`
        );

        const recentActionsResult = await db.query(
            `SELECT decision_type, COUNT(*) as count
             FROM agent_logs
             WHERE timestamp > NOW() - INTERVAL '24 hours' AND status = 'success'
             GROUP BY decision_type`
        );

        res.json({
            enabledAgents: parseInt(enabledAgentsResult.rows[0].count),
            totalActions: parseInt(totalActionsResult.rows[0].count),
            recentActions: recentActionsResult.rows,
        });
    } catch (error) {
        console.error('[Agent API] Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch agent statistics' });
    }
});

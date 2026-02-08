import cron from 'node-cron';
import AgentExecutionService from '../services/agentExecutionService.js';
import { db } from '../database/client.js';

export function startAgentScheduler(executionService: AgentExecutionService) {
    // Run every 5 minutes: '*/5 * * * *'
    // For testing, you can use '* * * * *' (every minute)
    const cronExpression = '*/5 * * * *';

    cron.schedule(cronExpression, async () => {
        const startTime = Date.now();
        console.log('[Agent Scheduler] Running evaluations...');

        try {
            // Get all companies with enabled agents
            const result = await db.query(`
                SELECT DISTINCT company_id FROM agent_config WHERE is_enabled = true
            `);

            if (result.rows.length === 0) {
                console.log('[Agent Scheduler] No enabled agents found');
                return;
            }

            console.log(`[Agent Scheduler] Found ${result.rows.length} enabled agents`);

            // Evaluate each company
            const promises = result.rows.map(async (row) => {
                try {
                    await executionService.evaluateCompany(row.company_id);
                } catch (error) {
                    console.error(`[Agent Scheduler] Error evaluating company ${row.company_id}:`, error);
                }
            });

            // Wait for all evaluations to complete
            await Promise.all(promises);

            const duration = Date.now() - startTime;
            console.log(`[Agent Scheduler] Evaluated ${result.rows.length} companies in ${duration}ms`);
        } catch (error) {
            console.error('[Agent Scheduler] Fatal error:', error);
        }
    });

    console.log(`[Agent Scheduler] Started with cron expression: ${cronExpression} (every 5 minutes)`);
    console.log('[Agent Scheduler] Waiting for first execution...');
}

import { Router } from 'express';
import StorkService from '../services/storkService.js';
import { db } from '../database/client.js';

export const oracleRoutes = Router();
const stork = new StorkService();

/**
 * GET /api/oracle/price/:companyId
 * Get latest price from Stork Network
 */
oracleRoutes.get('/price/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const oracleData = await stork.getOracleData(parseInt(companyId));

        res.json({
            companyId: parseInt(companyId),
            price: oracleData.price,
            timestamp: oracleData.timestamp,
        });
    } catch (error) {
        console.error('[Oracle API] Error fetching price:', error);
        res.status(500).json({ error: 'Failed to fetch price data' });
    }
});

/**
 * GET /api/oracle/signals/:companyId
 * Get all oracle signals (price, liquidity, demand, volume)
 */
oracleRoutes.get('/signals/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const oracleData = await stork.getOracleData(parseInt(companyId));

        res.json({
            companyId: parseInt(companyId),
            signals: {
                price: oracleData.price,
                volume: oracleData.volume,
                liquidity: oracleData.liquidity,
                demand: oracleData.demand,
            },
            timestamp: oracleData.timestamp,
        });
    } catch (error) {
        console.error('[Oracle API] Error fetching signals:', error);
        res.status(500).json({ error: 'Failed to fetch oracle signals' });
    }
});

/**
 * GET /api/oracle/history/:companyId/:dataType
 * Get historical oracle data
 * Query params: hours (default 24)
 */
oracleRoutes.get('/history/:companyId/:dataType', async (req, res) => {
    try {
        const { companyId, dataType } = req.params;
        const hours = parseInt(req.query.hours as string) || 24;

        const historicalData = await stork.getHistoricalData(parseInt(companyId), dataType, hours);

        res.json({
            companyId: parseInt(companyId),
            dataType,
            hours,
            data: historicalData,
        });
    } catch (error) {
        console.error('[Oracle API] Error fetching historical data:', error);
        res.status(500).json({ error: 'Failed to fetch historical oracle data' });
    }
});

/**
 * GET /api/oracle/latest
 * Get latest oracle data for all companies
 */
oracleRoutes.get('/latest', async (_req, res) => {
    try {
        const result = await db.query(`
            SELECT DISTINCT ON (company_id, data_type)
                company_id, data_type, value, timestamp
            FROM oracle_data
            ORDER BY company_id, data_type, timestamp DESC
        `);

        // Group by company
        const groupedData: Record<number, any> = {};
        result.rows.forEach(row => {
            if (!groupedData[row.company_id]) {
                groupedData[row.company_id] = { companyId: row.company_id, signals: {} };
            }
            groupedData[row.company_id].signals[row.data_type] = {
                value: parseFloat(row.value),
                timestamp: row.timestamp,
            };
        });

        res.json({ data: Object.values(groupedData) });
    } catch (error) {
        console.error('[Oracle API] Error fetching latest data:', error);
        res.status(500).json({ error: 'Failed to fetch latest oracle data' });
    }
});

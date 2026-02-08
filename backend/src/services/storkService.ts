import { config } from '../config.js';
import { db } from '../database/client.js';

interface StorkPriceData {
    timestamp: number;
    asset_id: string;
    price: string;
    signed_price: string;
}

interface OracleData {
    price: number;
    volume: number;
    liquidity: number;
    demand: string;
    timestamp: Date;
}

export default class StorkService {
    private baseUrl: string;
    private authToken: string | undefined;

    constructor() {
        this.baseUrl = config.storkApiUrl;
        this.authToken = config.storkAuthToken;
    }

    /**
     * Fetch latest price from Stork Network REST API
     */
    async getLatestPrice(assetId: string): Promise<number> {
        try {
            const url = `${this.baseUrl}/v1/prices/latest?assets=${assetId}`;
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.authToken) {
                headers['Authorization'] = `Basic ${this.authToken}`;
            }

            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`Stork API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.data || !data.data[0]) {
                throw new Error('No price data returned from Stork');
            }

            const priceData: StorkPriceData = data.data[0];
            const price = parseFloat(priceData.price) / 1e18; // Stork returns prices in 18 decimals

            return price;
        } catch (error) {
            console.error('[Stork] Error fetching price:', error);
            // Return mock data for development if API fails
            return this.getMockPrice(assetId);
        }
    }

    /**
     * Get liquidity signal (mock implementation - customize based on actual Stork API)
     */
    async getLiquiditySignal(_assetId: string): Promise<number> {
        try {
            // For now, return a mock value
            // In production, integrate with Stork's liquidity endpoints
            return Math.random() * 1000000; // Mock liquidity in USD
        } catch (error) {
            console.error('[Stork] Error fetching liquidity:', error);
            return 500000; // Default mock liquidity
        }
    }

    /**
     * Get volume data (mock implementation - customize based on actual Stork API)
     */
    async getVolumeData(_assetId: string): Promise<number> {
        try {
            // For now, return a mock value
            // In production, integrate with Stork's volume endpoints
            return Math.random() * 100000; // Mock 24h volume
        } catch (error) {
            console.error('[Stork] Error fetching volume:', error);
            return 50000; // Default mock volume
        }
    }

    /**
     * Cache oracle data to database
     */
    async cacheOracleData(
        companyId: number,
        dataType: string,
        value: number,
        metadata?: any
    ): Promise<void> {
        try {
            await db.query(
                `INSERT INTO oracle_data (company_id, data_type, source, value, metadata)
                 VALUES ($1, $2, $3, $4, $5)`,
                [companyId, dataType, 'stork', value, metadata ? JSON.stringify(metadata) : null]
            );
        } catch (error) {
            console.error('[Stork] Error caching oracle data:', error);
        }
    }

    /**
     * Get all oracle data for a company (used by Gemini agent)
     */
    async getOracleData(companyId: number): Promise<OracleData> {
        try {
            // Map company ID to asset ID (for now, use a mock mapping)
            const assetId = this.getAssetIdForCompany(companyId);

            const price = await this.getLatestPrice(assetId);
            const volume = await this.getVolumeData(assetId);
            const liquidity = await this.getLiquiditySignal(assetId);

            // Cache the data
            await this.cacheOracleData(companyId, 'price', price);
            await this.cacheOracleData(companyId, 'volume', volume);
            await this.cacheOracleData(companyId, 'liquidity', liquidity);

            // Calculate demand signal based on price trend and volume
            const demand = this.calculateDemandSignal(price, volume, liquidity);

            return {
                price,
                volume,
                liquidity,
                demand,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error('[Stork] Error getting oracle data:', error);
            // Return mock data as fallback
            return {
                price: 10.5,
                volume: 50000,
                liquidity: 500000,
                demand: 'medium',
                timestamp: new Date(),
            };
        }
    }

    /**
     * Calculate demand signal from oracle data
     */
    private calculateDemandSignal(_price: number, volume: number, liquidity: number): string {
        const volumeToLiquidityRatio = volume / liquidity;

        if (volumeToLiquidityRatio > 0.5) {
            return 'high';
        } else if (volumeToLiquidityRatio > 0.2) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Map company ID to Stork asset ID
     * TODO: This should be configurable per company in the database
     */
    private getAssetIdForCompany(companyId: number): string {
        // For now, use a default mapping
        // In production, store this mapping in the database
        const assetMap: Record<number, string> = {
            1: 'BTCUSD',
            2: 'ETHUSD',
            3: 'BTCUSD', // Default to BTC for testing
        };

        return assetMap[companyId] || 'BTCUSD';
    }

    /**
     * Get mock price data for development/testing
     */
    private getMockPrice(assetId: string): number {
        const mockPrices: Record<string, number> = {
            'BTCUSD': 45000 + Math.random() * 1000,
            'ETHUSD': 2500 + Math.random() * 100,
            'DEFAULT': 10 + Math.random() * 2,
        };

        return mockPrices[assetId] || mockPrices['DEFAULT'];
    }

    /**
     * Get historical oracle data from database
     */
    async getHistoricalData(companyId: number, dataType: string, hours: number = 24): Promise<any[]> {
        try {
            const result = await db.query(
                `SELECT value, timestamp FROM oracle_data
                 WHERE company_id = $1 AND data_type = $2
                 AND timestamp > NOW() - INTERVAL '${hours} hours'
                 ORDER BY timestamp DESC`,
                [companyId, dataType]
            );

            return result.rows;
        } catch (error) {
            console.error('[Stork] Error fetching historical data:', error);
            return [];
        }
    }
}

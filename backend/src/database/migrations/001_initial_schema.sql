-- ArcStock AI Agent Database Schema
-- Migration: 001_initial_schema.sql

-- Companies metadata cache (synced from blockchain)
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    equity_token_address VARCHAR(66) NOT NULL,
    company_wallet_address VARCHAR(66) NOT NULL,
    active BOOLEAN DEFAULT true,
    share_price DECIMAL(18, 6),
    total_supply DECIMAL(30, 18),
    treasury_balance DECIMAL(18, 6),
    market_cap DECIMAL(18, 6),
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent execution logs (what did the agent decide and do?)
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER REFERENCES companies(company_id),
    decision_type VARCHAR(50) NOT NULL, -- 'mint_shares', 'distribute_dividends', 'execute_buyback', 'hold', 'alert'
    status VARCHAR(20) NOT NULL, -- 'success', 'pending', 'failed'
    reasoning TEXT NOT NULL, -- Gemini's explanation
    action_params JSONB, -- {amount: 1000, recipients: [...]}
    tx_hash VARCHAR(66),
    execution_duration_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_status CHECK (status IN ('success', 'pending', 'failed'))
);

-- Stork Oracle data cache
CREATE TABLE IF NOT EXISTS oracle_data (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(company_id),
    data_type VARCHAR(50) NOT NULL, -- 'price', 'volume', 'liquidity', 'demand'
    source VARCHAR(100) NOT NULL DEFAULT 'stork',
    value DECIMAL(18, 6) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oracle_company_type ON oracle_data(company_id, data_type, timestamp DESC);

-- Gemini AI insights and predictions
CREATE TABLE IF NOT EXISTS gemini_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER REFERENCES companies(company_id),
    insight_type VARCHAR(50), -- 'price_prediction', 'action_recommendation', 'risk_assessment'
    insight_data JSONB NOT NULL,
    summary TEXT,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Agent configuration (per company, set by company wallet)
CREATE TABLE IF NOT EXISTS agent_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER UNIQUE NOT NULL REFERENCES companies(company_id),
    is_enabled BOOLEAN DEFAULT true,
    evaluation_interval_seconds INTEGER DEFAULT 300, -- 5 minutes
    risk_tolerance VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    max_mint_per_day DECIMAL(30, 18), -- safety limit
    max_dividend_per_day DECIMAL(18, 6), -- safety limit
    created_by VARCHAR(66) NOT NULL, -- company wallet address
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_logs_company_timestamp ON agent_logs(company_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(company_id, active);
CREATE INDEX IF NOT EXISTS idx_agent_config_enabled ON agent_config(is_enabled);

"use client";

import { StatCard } from "@/components/ui/StatCard";

interface PortfolioData {
    totalInvested: number;
    sharesOwned: number;
    dividendsReceived: number;
    companiesCount: number;
    monthlyGrowth: number;
    yieldPercentage: number;
}

interface PortfolioStatsProps {
    data?: PortfolioData;
}

const defaultData: PortfolioData = {
    totalInvested: 0,
    sharesOwned: 0,
    dividendsReceived: 0,
    companiesCount: 0,
    monthlyGrowth: 0,
    yieldPercentage: 0,
};

export function PortfolioStats({ data = defaultData }: PortfolioStatsProps) {
    return (
        <div className="flex flex-wrap gap-4">
            <StatCard
                title="Portfolio Value (USDC)"
                value={`$${data.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="monetization_on"
                trend={data.monthlyGrowth !== 0 ? { value: data.monthlyGrowth, label: "this month" } : undefined}
                className="flex-1 min-w-[200px]"
            />
            <StatCard
                title="Shares Owned"
                value={data.sharesOwned.toLocaleString()}
                icon="pie_chart"
                subtitle={`Across ${data.companiesCount} companies`}
                className="flex-1 min-w-[200px]"
            />
            <StatCard
                title="Dividends Received"
                value={`$${data.dividendsReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon="payments"
                subtitle={data.yieldPercentage > 0 ? `Net yield ${data.yieldPercentage}%` : undefined}
                className="flex-1 min-w-[200px] [&>p:nth-child(2)]:text-emerald-500"
            />
        </div>
    );
}

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
    totalInvested: 36302,
    sharesOwned: 400,
    dividendsReceived: 842,
    companiesCount: 3,
    monthlyGrowth: 12.5,
    yieldPercentage: 2.3,
};

export function PortfolioStats({ data = defaultData }: PortfolioStatsProps) {
    return (
        <div className="flex flex-wrap gap-4">
            <StatCard
                title="Total Invested (USDC)"
                value={`$${data.totalInvested.toLocaleString()}.00`}
                icon="monetization_on"
                trend={{ value: data.monthlyGrowth, label: "this month" }}
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
                value={`+ $${data.dividendsReceived.toLocaleString()}.00`}
                icon="payments"
                subtitle={`Net yield ${data.yieldPercentage}%`}
                className="flex-1 min-w-[200px] [&>p:nth-child(2)]:text-emerald-500"
            />
        </div>
    );
}

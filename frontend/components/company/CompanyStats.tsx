import { StatCard } from "@/components/ui/StatCard";
import { Company } from "@/types";

interface CompanyStatsProps {
    company: Company;
}

export function CompanyStats({ company }: CompanyStatsProps) {
    return (
        <div className="flex flex-wrap gap-4">
            <StatCard
                title="Treasury USDC Balance"
                value={`$${company.treasuryBalance.toLocaleString()}`}
                icon="account_balance_wallet"
                trend={{ value: 12.5, label: "(30d)" }}
                className="flex-1 min-w-[200px]"
            />
            <StatCard
                title="Tokenized Shares"
                value={company.ticker}
                icon="token"
                subtitle="On-chain ticker"
                className="flex-1 min-w-[200px]"
            />
            <StatCard
                title="Total Supply"
                value={company.totalSupply.toLocaleString()}
                icon="pie_chart"
                subtitle="Fully Diluted Units"
                className="flex-1 min-w-[200px]"
            />
        </div>
    );
}

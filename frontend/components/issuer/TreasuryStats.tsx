import { StatCard } from "@/components/ui/StatCard";

interface TreasuryData {
    balance: number;
    sharesIssued: number;
    shareholders: number;
    balanceChange: number;
    shareholderChange: number;
}

interface TreasuryStatsProps {
    data?: TreasuryData;
}

const defaultData: TreasuryData = {
    balance: 5200000,
    sharesIssued: 1000000,
    shareholders: 1240,
    balanceChange: 8.2,
    shareholderChange: 3.5,
};

export function TreasuryStats({ data = defaultData }: TreasuryStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                title="Treasury Balance"
                value={`$${data.balance.toLocaleString()}.00`}
                trend={{ value: data.balanceChange }}
            />
            <StatCard
                title="Total Shares Issued"
                value={data.sharesIssued.toLocaleString()}
                subtitle="0.0% change"
            />
            <StatCard
                title="Active Shareholders"
                value={data.shareholders.toLocaleString()}
                trend={{ value: data.shareholderChange }}
            />
        </div>
    );
}

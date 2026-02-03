"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Company, CompanyStatus, Sector } from "@/types";

interface CompanyTableProps {
    companies?: Company[];
    onInvest?: (company: Company) => void;
}

const sectorColors: Record<Sector, "info" | "success" | "warning" | "default"> = {
    technology: "info",
    energy: "success",
    finance: "warning",
    logistics: "default",
    healthcare: "info",
    "real-estate": "default",
    consumer: "warning",
    other: "default",
};

const statusLabels: Record<CompanyStatus, string> = {
    open: "Open",
    paused: "Paused",
    closed: "Closed",
};

const defaultCompanies: Company[] = [
    { id: "1", name: "Tesla Inc.", ticker: "TSLA-EQ", sector: "technology", isVerified: true, status: "open", sharePrice: 142.68, totalSupply: 1000000, treasuryBalance: 5200000, marketCap: 2400000000, createdAt: new Date() },
    { id: "2", name: "SpaceX", ticker: "SPACEX-EQ", sector: "technology", isVerified: true, status: "open", sharePrice: 102.40, totalSupply: 500000, treasuryBalance: 3100000, marketCap: 1200000000, createdAt: new Date() },
    { id: "3", name: "Stripe", ticker: "STRIPE-EQ", sector: "finance", isVerified: true, status: "open", sharePrice: 48.90, totalSupply: 800000, treasuryBalance: 2800000, marketCap: 850000000, createdAt: new Date() },
    { id: "4", name: "Rivian", ticker: "RIVN-EQ", sector: "energy", isVerified: true, status: "paused", sharePrice: 22.15, totalSupply: 1200000, treasuryBalance: 1500000, marketCap: 420000000, createdAt: new Date() },
];

export function CompanyTable({ companies = defaultCompanies, onInvest = () => { } }: CompanyTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="px-6 py-4 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">
                            Company Name
                        </th>
                        <th className="px-6 py-4 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">
                            Sector
                        </th>
                        <th className="px-6 py-4 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">
                            Price (USDC)
                        </th>
                        <th className="px-6 py-4 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-4 text-primary text-sm font-bold uppercase tracking-wider text-right">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company) => (
                        <tr
                            key={company.id}
                            className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                            <td className="px-6 py-5 text-slate-900 dark:text-white text-sm font-semibold">
                                {company.name}
                            </td>
                            <td className="px-6 py-5">
                                <Badge
                                    variant={sectorColors[company.sector]}
                                    size="md"
                                    className="capitalize"
                                >
                                    {company.sector.replace("-", " ")}
                                </Badge>
                            </td>
                            <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                ${company.sharePrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-5">
                                <Badge
                                    variant={company.status === "open" ? "success" : "warning"}
                                    size="md"
                                >
                                    {statusLabels[company.status]}
                                </Badge>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <Button
                                    size="sm"
                                    onClick={() => onInvest(company)}
                                    disabled={company.status !== "open"}
                                >
                                    Invest
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

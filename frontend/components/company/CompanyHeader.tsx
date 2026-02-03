import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Company } from "@/types";

interface CompanyHeaderProps {
    company: Company;
    onInvest: () => void;
}

export function CompanyHeader({ company, onInvest }: CompanyHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:justify-between items-start">
                <div className="flex gap-6 items-center">
                    {/* Company Logo */}
                    <div className="size-32 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-primary">
                            corporate_fare
                        </span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold leading-tight tracking-[-0.025em]">
                                {company.name}
                            </h1>
                            {company.isVerified && (
                                <Badge variant="success" size="sm">
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                            Real-world Equity Token (RWET)
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="material-symbols-outlined text-sm text-slate-400">
                                description
                            </span>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                Legal Hash: {company.legalHash || "0x7f8d...3a92"}
                            </p>
                            <button className="text-primary hover:underline text-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">
                                    content_copy
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex w-full max-w-[480px] gap-3 lg:w-auto pt-4 lg:pt-0">
                    <Button variant="secondary" className="flex-1 lg:flex-initial">
                        Add to Watchlist
                    </Button>
                    <Button onClick={onInvest} className="flex-1 lg:flex-initial">
                        Invest Now
                    </Button>
                </div>
            </div>
        </div>
    );
}

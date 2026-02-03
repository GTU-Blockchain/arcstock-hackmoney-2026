export function ComplianceDetails() {
    const complianceItems = [
        { label: "SEC Rule 506(c) Compliant", checked: true },
        { label: "KYC/AML Whitelisting Active", checked: true },
        { label: "Transfer Restricted to Verified Investors", checked: true },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">security</span>
                Compliance Details
            </h3>
            <div className="space-y-3">
                {complianceItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span
                            className={`material-symbols-outlined text-sm ${item.checked ? "text-green-500" : "text-slate-400"
                                }`}
                        >
                            {item.checked ? "check_circle" : "cancel"}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.label}
                        </p>
                    </div>
                ))}
                <button className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download Prospectus (PDF)
                </button>
            </div>
        </div>
    );
}

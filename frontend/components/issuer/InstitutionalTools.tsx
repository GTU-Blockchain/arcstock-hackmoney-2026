import Link from "next/link";

interface QuickLink {
    label: string;
    icon: string;
    href: string;
}

const links: QuickLink[] = [
    { label: "Legal Compliance Vault", icon: "open_in_new", href: "#" },
    { label: "Tax Withholding Reports", icon: "description", href: "#" },
    { label: "KYC/AML Registry", icon: "verified_user", href: "#" },
];

export function InstitutionalTools() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4">
                Institutional Tools
            </h3>
            <div className="flex flex-col gap-3">
                {links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
                    >
                        {link.label}
                        <span className="material-symbols-outlined text-lg">
                            {link.icon}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

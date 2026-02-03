import Link from "next/link";
import { ArcLogo } from "@/components/icons/ArcLogo";

const footerLinks = {
    platform: [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/market", label: "Markets" },
        { href: "#wallets", label: "Wallets" },
    ],
    company: [
        { href: "#about", label: "About Us" },
        { href: "#careers", label: "Careers" },
        { href: "#press", label: "Press" },
    ],
    resources: [
        { href: "#docs", label: "Documentation" },
        { href: "#api", label: "API Reference" },
        { href: "#help", label: "Help Center" },
    ],
    legal: [
        { href: "#privacy", label: "Privacy Policy" },
        { href: "#terms", label: "Terms of Service" },
        { href: "#compliance", label: "Compliances" },
    ],
};

export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 text-primary mb-6">
                            <ArcLogo size={24} />
                            <span className="text-slate-900 dark:text-white font-bold text-lg">
                                Arc Stock
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            The global gateway for tokenized real-world assets. Secure,
                            compliant, and unified.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-6 uppercase tracking-widest">
                            Platform
                        </h4>
                        <ul className="flex flex-col gap-4">
                            {footerLinks.platform.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-500 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-6 uppercase tracking-widest">
                            Company
                        </h4>
                        <ul className="flex flex-col gap-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-500 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-6 uppercase tracking-widest">
                            Resources
                        </h4>
                        <ul className="flex flex-col gap-4">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-500 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-6 uppercase tracking-widest">
                            Legal
                        </h4>
                        <ul className="flex flex-col gap-4">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-500 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-xs">
                        © 2024 Arc Stock Technologies Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">public</span>
                        </a>
                        <a
                            href="#"
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">
                                alternate_email
                            </span>
                        </a>
                        <a
                            href="#"
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">share</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

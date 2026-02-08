"use client";

import Link from "next/link";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { ArcLogo } from "@/components/icons/ArcLogo";

type UserType = "investor" | "issuer";

export default function LoginPage() {
    const [userType, setUserType] = useState<UserType>("investor");
    const { isConnected } = useAccount();
    const dashboardPath = userType === "investor" ? "/investor/dashboard" : "/issuer/dashboard";

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-950 p-12 flex-col justify-between border-r border-slate-800">
                <div className="flex items-center gap-3 text-primary">
                    <ArcLogo size={40} />
                    <span className="text-white font-bold text-2xl">Arc Stock</span>
                </div>

                <div className="space-y-6">
                    <h1 className="text-white text-5xl font-black leading-tight">
                        Tokenized Equity.
                        <br />
                        <span className="text-primary">From Any Chain.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        Invest in real companies or issue your own equity tokens.
                        Experience the future of chain-abstracted equity management.
                    </p>
                </div>

                <p className="text-slate-500 text-sm">
                    © 2024 Arc Stock Technologies Inc.
                </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 text-primary mb-8">
                        <ArcLogo size={32} />
                        <span className="text-white font-bold text-xl">Arc Stock</span>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-white text-3xl font-bold">Welcome Back</h2>
                        <p className="text-slate-400">Choose how you want to continue</p>
                    </div>

                    {/* User Type Toggle */}
                    <div className="bg-slate-900 p-1.5 rounded-xl flex gap-2">
                        <button
                            onClick={() => setUserType("investor")}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${userType === "investor"
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg align-middle mr-2">
                                trending_up
                            </span>
                            Investor
                        </button>
                        <button
                            onClick={() => setUserType("issuer")}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${userType === "issuer"
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg align-middle mr-2">
                                corporate_fare
                            </span>
                            Issuer
                        </button>
                    </div>

                    {/* Description based on user type */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                        {userType === "investor" ? (
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <div>
                                    <p className="text-white font-medium text-sm">Investor Portal</p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Browse and invest in tokenized equity from verified companies.
                                        Manage your portfolio across multiple chains.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <div>
                                    <p className="text-white font-medium text-sm">Issuer Portal</p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Issue and manage your company's tokenized equity.
                                        Configure treasury rules and distribute dividends.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Connect Wallet + Continue */}
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <ConnectButton />
                        </div>
                        {isConnected && (
                            <Link href={dashboardPath} className="block">
                                <Button className="w-full" size="lg">
                                    Continue to {userType === "investor" ? "Investor" : "Issuer"} Dashboard
                                </Button>
                            </Link>
                        )}
                        <p className="text-center text-slate-500 text-xs">
                            Brave kullanıyorsanız: brave://settings/web3 adresinde varsayılan cüzdanı &quot;Extensions&quot; (MetaMask) olarak ayarlayın.
                        </p>
                    </div>

                    {/* Alternative Options */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="text-slate-500 text-xs">or continue with</span>
                        <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" className="w-full">
                            <span className="material-symbols-outlined text-lg mr-2">mail</span>
                            Email
                        </Button>
                        <Button variant="secondary" className="w-full">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </Button>
                    </div>

                    {/* Footer Links */}
                    <div className="text-center space-y-4 pt-4">
                        <p className="text-slate-500 text-xs">
                            By connecting, you agree to our{" "}
                            <a href="#" className="text-primary hover:underline">Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                        </p>
                        <Link href="/" className="text-slate-400 text-sm hover:text-white inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

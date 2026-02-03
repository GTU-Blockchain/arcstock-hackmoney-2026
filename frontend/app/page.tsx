import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArcLogo } from "@/components/icons/ArcLogo";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header variant="marketing" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-10 py-16">
          <div className="flex flex-col gap-10 lg:flex-row items-center">
            {/* Hero Content */}
            <div className="flex flex-col gap-8 flex-1">
              <div className="flex flex-col gap-4">
                <Badge variant="primary" size="md" className="w-fit">
                  Now Live: Ethereum & Base Support
                </Badge>
                <h1 className="text-white text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.03em]">
                  Tokenized Equity.{" "}
                  <br />
                  <span className="text-primary">From Any Chain.</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl font-normal leading-relaxed max-w-[540px]">
                  Invest in real companies using USDC without bridges or network
                  switching. Experience the future of chain-abstracted equity
                  management.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <Button size="lg" className="min-w-[160px] rounded-xl">
                    Start Investing
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="min-w-[160px] rounded-xl"
                  >
                    Issue Shares
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="flex-1 w-full max-w-[600px]">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-8 flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />

                {/* Chain Diagram */}
                <div className="z-10 flex flex-col items-center gap-12 w-full">
                  {/* Source Chains */}
                  <div className="flex justify-between w-full max-w-sm px-4">
                    {["ETH", "BASE"].map((chain) => (
                      <div
                        key={chain}
                        className="size-14 rounded-2xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center border border-slate-100 dark:border-slate-600"
                      >
                        <span className="text-xs font-bold text-slate-400">
                          {chain}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Hub */}
                  <div className="relative w-full flex justify-center py-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                    </div>
                    <div className="size-24 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 relative">
                      <span className="material-symbols-outlined text-white text-4xl">
                        hub
                      </span>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-600 w-full max-w-xs text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Portfolio Asset
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      Series A Equity Token
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-slate-900/50 py-12 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Total Value Locked", value: "$1.2B+" },
                { label: "Companies Listed", value: "150+" },
                { label: "Chains Supported", value: "2" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                >
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col gap-16">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2 className="text-white text-4xl lg:text-5xl font-black leading-tight tracking-tight max-w-[800px]">
                The Infrastructure for Modern Equity
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-normal max-w-[640px]">
                Arc Stock abstracts the complexity of fragmentation across the
                blockchain landscape, allowing institutional capital to flow
                freely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "currency_exchange",
                  title: "Native USDC Support",
                  description:
                    "Invest directly with USDC on your preferred chain. No need to hold native gas tokens or swap currencies.",
                },
                {
                  icon: "account_tree",
                  title: "Bridge-less UX",
                  description:
                    "Eliminate the friction of bridging assets. Our cross-chain messaging layer handles the complexity in the background.",
                },
                {
                  icon: "verified_user",
                  title: "Institutional Grade",
                  description:
                    "Secure, compliant, and audited smart contracts. Regulated frameworks designed for global enterprise requirements.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 transition-all hover:border-primary/50 group"
                >
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">
                      {feature.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div className="relative rounded-[2rem] bg-slate-900 dark:bg-slate-800 overflow-hidden px-8 py-20 lg:py-24 text-center flex flex-col items-center gap-10 border border-slate-800 dark:border-slate-700">
              {/* Background Gradient */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at top right, #137fec 0%, transparent 70%)",
                }}
              />

              <div className="flex flex-col gap-4 relative z-10">
                <h2 className="text-white text-4xl lg:text-5xl font-black leading-tight tracking-tight max-w-[720px]">
                  Ready to tokenize your company equity?
                </h2>
                <p className="text-slate-400 text-lg lg:text-xl font-normal max-w-[640px] mx-auto">
                  Join the next generation of global capital markets. Secure,
                  efficient, and chain-abstracted.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                <Link href="/dashboard">
                  <Button size="lg" className="min-w-[200px] rounded-xl">
                    Get Started Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] rounded-xl border-slate-700 text-white hover:bg-slate-800"
                >
                  Talk to an Expert
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

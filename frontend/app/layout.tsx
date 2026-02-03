import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arc Stock | Tokenized Equity From Any Chain",
  description:
    "Invest in real companies using USDC without bridges or network switching. Experience the future of chain-abstracted equity management.",
  keywords: [
    "tokenized equity",
    "RWA",
    "real world assets",
    "USDC investment",
    "chain abstracted",
    "Arc Stock",
    "equity tokens",
  ],
  openGraph: {
    title: "Arc Stock | Tokenized Equity From Any Chain",
    description:
      "Invest in real companies using USDC without bridges or network switching.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingChatButton, Footer, MobileBottomNav, Navbar, SecurityStrip } from "@/components/layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alfarez.com"),
  title: {
    default: "Alfarezel Market - Jual Beli Akun Game Aman",
    template: "%s | Alfarezel Market",
  },
  description:
    "Marketplace jual beli akun game Indonesia dengan saldo web, escrow admin hold, chat transaksi, report, top up manual DANA/GoPay, withdraw seller, dan admin panel.",
  openGraph: {
    title: "Alfarezel Market",
    description: "Jual beli akun game aman dengan sistem saldo, escrow, chat transaksi, dan report.",
    url: "https://alfarez.com",
    siteName: "Alfarezel Market",
    images: ["/og-image.png"],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-950">
        <Navbar />
        <SecurityStrip />
        <div className="min-h-[60vh]">{children}</div>
        <Footer />
        <FloatingChatButton />
        <MobileBottomNav />
      </body>
    </html>
  );
}

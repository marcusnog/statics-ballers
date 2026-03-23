import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Estatics Ballers — Estatísticas de Apostas",
  description:
    "Estatísticas de apostas esportivas em futebol europeu e sul-americano. Métricas, comparativo por liga, jogos recentes e recomendações.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={plusJakarta.variable}>
      <body className="antialiased min-h-screen font-sans">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

"use client";

import { useEffect, useState } from "react";
import { metricsUrl } from "@/lib/data-url";

const NAV_LINKS = [
  { href: "#visao-geral", label: "Visão Geral" },
  { href: "#ligas", label: "Ligas" },
  { href: "#jogos-do-dia", label: "Jogos do dia" },
  { href: "#jogos", label: "Jogos" },
  { href: "#relatorio", label: "Relatório" },
  { href: "#recomendacoes", label: "Recomendações" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function Header() {
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    fetch(metricsUrl())
      .then((r) => r.json())
      .then((data) => setUpdatedAt(data.updated_at ?? null))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-slate-200/60 shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)]">
      {/* Green gradient accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15 sm:h-[68px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3 C12 3 9 7 9 12 S12 21 12 21" strokeLinecap="round" />
                <path d="M3 12 h18" strokeLinecap="round" />
                <path d="M5.5 6.5 C7 8 10 9 12 9 S17 8 18.5 6.5" strokeLinecap="round" />
                <path d="M5.5 17.5 C7 16 10 15 12 15 S17 16 18.5 17.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                Estatics Ballers
              </h1>
              <p className="text-[11px] text-emerald-600 font-medium hidden sm:block mt-0.5">
                Futebol Europeu & Sul-Americano
              </p>
            </div>
          </div>

          {/* Last updated badge */}
          {updatedAt && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-slate-600 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-slate-500">Atualizado</span>
              <span className="font-medium text-slate-700">{formatDate(updatedAt)}</span>
            </div>
          )}

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setNavOpen(!navOpen)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {navOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {navOpen && (
          <nav className="sm:hidden py-3 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setNavOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {updatedAt && (
                <p className="px-4 py-2 text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Atualizado {formatDate(updatedAt)}
                </p>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

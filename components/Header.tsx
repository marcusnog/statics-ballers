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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              E
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Estatics Ballers
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Futebol Europeu & Sul-Americano
              </p>
            </div>
          </div>

          {updatedAt && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Atualizado {formatDate(updatedAt)}
            </div>
          )}

          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setNavOpen(!navOpen)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {navOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {navOpen && (
          <nav className="sm:hidden py-4 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setNavOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {link.label}
                </a>
              ))}
              {updatedAt && (
                <p className="px-4 py-2 text-xs text-slate-500 mt-2">
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

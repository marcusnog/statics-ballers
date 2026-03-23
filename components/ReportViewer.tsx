"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface ReportViewerProps {
  content: string | null;
  date: string | null;
  message?: string;
}

const reportComponents = {
  h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-base font-medium text-slate-500 mb-4 pb-4 border-b border-slate-100">{children}</h1>
  ),
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-base font-semibold text-slate-800 mt-6 mb-3 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-emerald-500" />
      {children}
    </h2>
  ),
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-sm font-medium text-slate-700 mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-600 text-sm leading-relaxed my-3">{children}</p>
  ),
  blockquote: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <div data-report-blockquote className="my-4 p-4 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-600 text-sm leading-relaxed [&_strong]:text-slate-800 [&_p]:my-0">
      {children}
    </div>
  ),
  table: ({ children }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 overflow-hidden bg-white">
      <table className="min-w-full divide-y divide-slate-200">{children}</table>
    </div>
  ),
  thead: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-slate-50">
      <tr>{children}</tr>
    </thead>
  ),
  th: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/80">
      {children}
    </th>
  ),
  td: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-sm text-slate-700">
      {children}
    </td>
  ),
  tr: ({ children }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors even:bg-slate-50/30">{children}</tr>
  ),
  tbody: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody>{children}</tbody>
  ),
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-3 space-y-1.5 list-disc list-inside text-slate-600 text-sm">{children}</ul>
  ),
  li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed">{children}</li>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
  strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-slate-800">{children}</strong>
  ),
};

export default function ReportViewer({ content, date, message }: ReportViewerProps) {
  if (message && !content) {
    return (
      <section id="relatorio" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <h2 className="section-title section-divider">Relatório do Dia</h2>
        <div className="card-base p-5 border-amber-200 bg-amber-50/50">
          <p className="text-amber-800 text-sm">{message}</p>
        </div>
      </section>
    );
  }

  if (!content) {
    return (
      <section id="relatorio" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <h2 className="section-title section-divider">Relatório do Dia</h2>
        <div className="card-base p-8 text-center">
          <p className="text-slate-500">Nenhum relatório disponível.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="relatorio" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: "0.25s" }}>
      <h2 className="section-title section-divider">
        Relatório do Dia {date && <span className="text-slate-500 font-normal">({date})</span>}
      </h2>
      <div className="card-base overflow-hidden">
        <div className="p-6 sm:p-8 report-content">
          <ReactMarkdown components={reportComponents}>{content}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}

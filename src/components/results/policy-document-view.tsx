import * as React from "react";
import type { PolicyDocument } from "@/lib/policy/types";

/** Renders a generated policy document: summary, clauses, and optional table. */
export function PolicyDocumentView({ doc }: { doc: PolicyDocument }) {
  return (
    <article className="space-y-5">
      <header>
        <h3 className="text-xl font-semibold tracking-tight">{doc.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{doc.summary}</p>
      </header>

      {doc.clauses.map((clause) => (
        <section key={clause.id} className="space-y-2">
          <h4 className="text-sm font-semibold">{clause.heading}</h4>
          {clause.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
          {clause.bullets && clause.bullets.length > 0 && (
            <ul className="ml-4 list-disc space-y-1 text-sm text-foreground/90">
              {clause.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {doc.table && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-secondary/60 text-left">
                {doc.table.columns.map((col) => (
                  <th key={col} className="border-b border-border px-3 py-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doc.table.rows.map((row, ri) => (
                <tr key={ri} className="align-top">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border-b border-border/60 px-3 py-2 text-foreground/90"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

"use client";

import { ReactNode } from "react";

interface ChartSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  delay?: number;
}

export default function ChartSection({ title, subtitle, children, delay = 0 }: ChartSectionProps) {
  return (
    <div className={`card-glass card-accent-left rounded-xl p-6 md:p-8 fade-in-up fade-in-up-${delay}`}>
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1.5">
          <h2
            className="font-serif text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
        </div>
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {subtitle}
        </p>
      </div>
      <div className="divider-gradient mb-5" />
      {children}
    </div>
  );
}

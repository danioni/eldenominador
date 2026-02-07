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
    <div className={`card-glass rounded-xl p-6 fade-in-up fade-in-up-${delay}`}>
      <div className="mb-5">
        <h2
          className="font-serif text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p
          className="text-[11px] mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, Printer } from "lucide-react";

export function PrintToolbar({ autoPrint = false }: { autoPrint?: boolean }) {
  const opened = useRef(false);
  useEffect(() => {
    if (!autoPrint || opened.current) return;
    opened.current = true;
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);
  return <div className="print-toolbar">
    <button type="button" className="button button-secondary" onClick={() => window.close()}><ArrowLeft size={16} />Đóng</button>
    <button type="button" className="button" onClick={() => window.print()}><Printer size={16} />In ngay</button>
  </div>;
}

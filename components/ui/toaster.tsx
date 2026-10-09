"use client";

import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, XCircle } from "lucide-react";

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => dismiss(item.id)}
          className={cn(
            "pointer-events-auto rounded-lg border bg-white p-3 text-left shadow-card",
            item.kind === "success" && "border-emerald-200",
            item.kind === "error" && "border-rose-200",
            item.kind === "info" && "border-sky-200"
          )}
        >
          <div className="flex items-start gap-2">
            {item.kind === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
            {item.kind === "error" && <XCircle className="mt-0.5 h-4 w-4 text-rose-600" />}
            {item.kind === "info" && <Info className="mt-0.5 h-4 w-4 text-sky-600" />}
            <div>
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              {item.description && (
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

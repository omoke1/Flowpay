"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: number }>>([]);

  const toast = React.useCallback((props: ToastProps) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...props, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, props.duration || 3000);
  }, []);

  return { toast, toasts };
}

export function ToastContainer({ toasts }: { toasts: Array<ToastProps & { id: number }> }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-lg px-6 py-4 shadow-lg animate-in slide-in-from-bottom-5",
            {
              "bg-flow-green text-flow-dark": toast.type === "success",
              "bg-red-500 text-white": toast.type === "error",
              "bg-flow-surface border border-flow-gray text-white": toast.type === "info" || !toast.type,
            }
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}


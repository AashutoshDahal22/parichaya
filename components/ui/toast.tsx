"use client";

import { useEffect } from "react";
import { X, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

type ToastType = "error" | "success" | "info" | "warning";

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
};

const toastStyles = {
  error: {
    icon: CircleAlert,
    container: "border-red-200 bg-red-50",
    iconColor: "text-red-600",
    textColor: "text-red-800",
  },
  success: {
    icon: CircleCheck,
    container: "border-green-200 bg-green-50",
    iconColor: "text-green-600",
    textColor: "text-green-800",
  },
  info: {
    icon: Info,
    container: "border-blue-200 bg-blue-50",
    iconColor: "text-blue-600",
    textColor: "text-blue-800",
  },
  warning: {
    icon: TriangleAlert,
    container: "border-amber-200 bg-amber-50",
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
  },
};

export function Toast({
  message,
  type = "error",
  onClose,
  duration = 5000,
}: ToastProps) {
  const style = toastStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(onClose, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`fixed right-5 top-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200 ${style.container}`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${style.iconColor}`} />

      <p className={`flex-1 text-sm leading-5 ${style.textColor}`}>{message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900"
      >
        <X size={16} />
      </button>
    </div>
  );
}

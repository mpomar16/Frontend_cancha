// components/Alerta.jsx
import { useEffect, useId } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X as IconX,
} from "lucide-react";

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    ring: "ring-emerald-200",
    bg: "bg-emerald-10",
    text: "text-emerald-800",
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  error: {
    icon: XCircle,
    ring: "ring-red-200",
    bg: "bg-red-50",
    text: "text-red-800",
    primary: "bg-red-600 hover:bg-red-700 text-white",
  },
  confirm: {
    icon: AlertTriangle,
    ring: "ring-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-900",
    primary: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: AlertTriangle,
    ring: "ring-amber-200",
    bg: "bg-amber-10",
    text: "text-amber-900",
    primary: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  info: {
    icon: Info,
    ring: "ring-sky-200",
    bg: "bg-sky-50",
    text: "text-sky-900",
    primary: "bg-sky-600 hover:bg-sky-700 text-white",
  },
};

export default function Alerta({
  open = false,
  onClose = () => {},
  variant = "info",
  display = "modal", // "modal" | "inline"
  title,
  message,
  imageSrc,              // opcional
  primaryAction,         // { label, onClick, loading }
  secondaryAction,       // { label, onClick }
  showClose = true,
  closeOnBackdrop = true,
}) {
  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info;
  const Icon = cfg.icon;
  const titleId = useId();
  const descId = useId();

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open && display === "modal") return null;

  const content = (
    <div
      className={`w-full ${cfg.bg} rounded-xl p-4 sm:p-5 ${cfg.text} shadow-sm`}
      role="dialog"
      aria-modal={display === "modal" ? "true" : "false"}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="flex items-start gap-3">
        {/* Icono o imagen */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="w-12 h-12 rounded-md object-cover border border-1 bg-white"
          />
        ) : (
          <Icon className="w-6 h-6 mt-0.5 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h3 id={titleId} className="text-base sm:text-lg font-semibold truncate">
              {title}
            </h3>
          )}
          {message && (
            <p id={descId} className="mt-1 text-sm sm:text-base whitespace-pre-wrap">
              {message}
            </p>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {secondaryAction && (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className={`px-3 py-1.5 rounded-md bg-white border border-1 hover:bg-gray-50 text-gray-800`}
                >
                  {secondaryAction.label}
                </button>
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.loading}
                  className={`px-3 py-1.5 rounded-md ${cfg.primary} disabled:opacity-60`}
                >
                  {primaryAction.loading ? "Procesando…" : primaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>

        {showClose && (
          <button
            aria-label="Cerrar"
            className="ml-2 p-1 rounded hover:bg-black/5"
            onClick={onClose}
          >
            <IconX className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  if (display === "inline") {
    return content;
  }

  // display === "modal"
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => closeOnBackdrop && onClose()}
      />
      {/* Contenedor modal */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className={`w-full max-w-lg rounded-xl ring-1 ${cfg.ring}`}>{content}</div>
      </div>
    </div>
  );
}


// src/components/common/Modal.jsx
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children }) {
    const [visible, setVisible] = useState(open);
    const [animateIn, setAnimateIn] = useState(false);

    // manejar montaje/desmontaje para animación de salida
    useEffect(() => {
        if (open) {
            setVisible(true);
            requestAnimationFrame(() => setAnimateIn(true)); // entra
        } else {
            setAnimateIn(false); // dispara salida
            const t = setTimeout(() => setVisible(false), 200); // == duration
            return () => clearTimeout(t);
        }
    }, [open]);

    // ESC para cerrar + bloquear scroll
    useEffect(() => {
        if (!visible) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [visible, onClose]);

    if (!visible) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4
              bg-azul-950/50 backdrop-blur-sm transition-opacity duration-200
              ${animateIn ? "opacity-100" : "opacity-0"}`}
            onMouseDown={onClose}
        >
            <div
                className={`relative max-h-[90vh] w-[92vw] sm:w-[min(90vw,40rem)] md:w-[min(90vw,56rem)]
                overflow-auto rounded-2xl border border-gris-200 bg-blanco-50 shadow-xl
                transition-all duration-200
                ${animateIn ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"}`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={onClose}
                    className="absolute right-2 top-2 sm:right-3 sm:top-3 grid h-9 w-9 sm:h-10 sm:w-10
                 place-items-center rounded-full text-azul-950 hover:bg-gris-100"
                >
                    <span className="text-2xl leading-none">×</span>
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}

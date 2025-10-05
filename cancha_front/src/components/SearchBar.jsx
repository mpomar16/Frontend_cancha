// components/SearchBar.jsx
import { useEffect, useRef, useState } from "react";
import { Search, Loader2, ChevronDown, ChevronUp, X, Check } from "lucide-react";

/**
 * modos: [{ valor, etiqueta, placeholder?, avatar?, icon?: ReactNode, label?: string }]
 * ejecutarPorModo: { [valor]: (termino) => Promise<any> }
 */
export default function SearchBar({
  modos = [{ valor: "texto", etiqueta: "Texto", placeholder: "Buscar…" }],
  ejecutarPorModo = {},
  onResultados,
  onError,
  onLimpiar,
  tipoInicial = modos[0]?.valor ?? "texto",
  terminoInicial = "",
  botonTexto = "Buscar",
  textoLimpiar = "Limpiar",
  validar,
  deshabilitado = false,
  className = "",
}) {
  const [tipo, setTipo] = useState(tipoInicial);
  const [termino, setTermino] = useState(terminoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const modoActual = modos.find((m) => m.valor === tipo) ?? modos[0];
  const placeholderActual = modoActual?.placeholder || `Buscar por ${modoActual?.etiqueta || tipo}`;

  async function manejarSubmit(e) {
    e.preventDefault();
    if (deshabilitado || cargando) return;

    if (typeof validar === "function") {
      const msg = validar(tipo, termino);
      if (msg) {
        setError(msg);
        onError?.(msg);
        return;
      }
    }

    const ejecutor = ejecutarPorModo?.[tipo];
    if (typeof ejecutor !== "function") {
      const msg = `No hay ejecutor configurado para "${tipo}".`;
      setError(msg);
      onError?.(msg);
      return;
    }

    try {
      setError("");
      setCargando(true);
      const resultado = await ejecutor(termino);
      const normalizado = Array.isArray(resultado) ? resultado : [resultado];
      onResultados?.(normalizado);
    } catch (err) {
      const msg = err?.message ?? "Error al realizar la búsqueda";
      setError(msg);
      onError?.(msg);
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setTermino("");
    setError("");
    onResultados?.([]);
    onLimpiar?.();
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className={`bg-white/90 backdrop-blur p-4 md:p-5 rounded-xl border border-gris-200 shadow-sm ${className}`}
    >
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr_auto_auto] gap-3 items-center">
        {/* Select de modos (imitación Radix) */}
        <Select
          items={modos}
          value={tipo}
          onChange={setTipo}
          disabled={deshabilitado || cargando}
        />

        {/* Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-azul-950" />
          </span>
          <input
            type="text"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            placeholder={placeholderActual}
            disabled={deshabilitado || cargando}
            className="w-full h-[44px] pl-10 pr-10 rounded-lg border border-gris-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-verde-600 placeholder-gray-400 disabled:opacity-50"
          />
          {termino && !cargando && (
            <button
              type="button"
              onClick={() => setTermino("")}
              className="absolute inset-y-0 right-3 flex items-center"
              title="Limpiar texto"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>

        {/* Botón Buscar */}
        <button
          type="submit"
          disabled={deshabilitado || cargando}
          className="text-sm h-[44px] px-5 rounded-lg bg-verde-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {cargando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Buscando…
            </>
          ) : (
            botonTexto
          )}
        </button>

        {/* Botón Limpiar (junto a Buscar) */}
        <button
          type="button"
          onClick={limpiar}
          disabled={deshabilitado || cargando}
          className="h-[44px] px-5 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {textoLimpiar}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   Select — “Radix-like” sin dependencias
   - Soporta avatar o icono por opción
   - Teclado: ↑/↓ navega, Enter selecciona, Esc cierra
   - Cierra con click fuera
   ========================================================= */
function Select({ items, value, onChange, disabled }) {
  const [abierto, setAbierto] = useState(false);
  const [focusIndex, setFocusIndex] = useState(
    Math.max(0, items.findIndex((i) => i.valor === value))
  );

  const contRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const seleccionado = items.find((i) => i.valor === value) ?? items[0];

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (!contRef.current) return;
      if (!contRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    if (abierto) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [abierto]);

  // Teclado
  useEffect(() => {
    function onKey(e) {
      if (!abierto) return;
      if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        setFocusIndex((i) => (i + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        setFocusIndex((i) => (i - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        const item = items[focusIndex];
        if (item) {
          onChange(item.valor);
          setAbierto(false);
          // devuelve foco al botón
          btnRef.current?.focus();
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        setAbierto(false);
        btnRef.current?.focus();
      }
    }
    if (abierto) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, focusIndex, items, onChange]);

  // Abrir/cerrar y enfocar
  function toggle() {
    if (disabled) return;
    setAbierto((a) => {
      const next = !a;
      if (next) {
        const idx = Math.max(0, items.findIndex((i) => i.valor === value));
        setFocusIndex(idx);
        setTimeout(() => {
          // enfoca lista para lectores de pantalla
          listRef.current?.focus();
        }, 0);
      }
      return next;
    });
  }

  function seleccionar(idx) {
    const item = items[idx];
    if (!item) return;
    onChange(item.valor);
    setAbierto(false);
    btnRef.current?.focus();
  }

  return (
    <div className="w-full relative" ref={contRef}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className="w-full inline-flex items-center justify-between px-3 py-2 h-[44px] text-sm text-azul-950 bg-white border rounded-lg shadow-sm outline-none focus:ring-1 focus:ring-verde-600 disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          {seleccionado?.avatar && (
            <img src={seleccionado.avatar} className="w-5 h-5 rounded-full" />
          )}
          {seleccionado?.icon && !seleccionado?.avatar && (
            <span className="w-5 h-5 flex items-center justify-center">
              {seleccionado.icon}
            </span>
          )}
          <span className="font-medium">
            {seleccionado?.etiqueta || seleccionado?.valor}
          </span>
          {seleccionado?.label && (
            <span className="ml-1 text-azul-950">{seleccionado.label}</span>
          )}
        </div>
        <span className="text-gray-400">
          {abierto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {abierto && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="w-full absolute z-50 mt-2 max-h-64 overflow-y-auto bg-white border rounded-lg shadow-sm text-sm outline-none"
        >
          {items.map((item, idx) => {
            const seleccionado = item.valor === value;
            const resaltado = idx === focusIndex;
            return (
              <li
                key={item.valor}
                role="option"
                aria-selected={seleccionado}
                onMouseEnter={() => setFocusIndex(idx)}
                onClick={() => seleccionar(idx)}
                className={[
                  "flex items-center justify-between px-3 cursor-default py-2 duration-150",
                  seleccionado
                    ? "text-verde-600 bg-verde-600/15"
                    : "text-gray-700",
                  resaltado ? "bg-verde-600/15 text-verde-600" : "",
                ].join(" ")}
              >
                <div className="pr-4 line-clamp-1 flex items-center gap-2">
                  {item.avatar ? (
                    <img src={item.avatar} className="w-5 h-5 rounded-full" />
                  ) : item.icon ? (
                    <span className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="font-medium">
                    {item.etiqueta || item.valor}
                  </span>
                  {item.label && (
                    <span className="text-azul-950">{item.label}</span>
                  )}
                </div>
                <div className="w-6">
                  {seleccionado && (
                    <Check size={20}/>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


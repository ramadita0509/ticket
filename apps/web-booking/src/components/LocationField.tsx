"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  shortLocationLabel,
  typeLabel,
  type LocationSuggestion,
  type LocationType,
} from "@/lib/locations";

type Props = {
  label: string;
  valueCode: string;
  displayValue: string;
  onSelect: (loc: LocationSuggestion) => void;
  onDisplayChange: (text: string) => void;
  onClearCode: () => void;
  placeholder?: string;
  className?: string;
  /** Align dropdown to start (Dari) or end (Ke) */
  menuAlign?: "start" | "end";
};

function TypeIcon({ type }: { type: LocationType }) {
  const common =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl";
  if (type === "country") {
    return (
      <span className={`${common} bg-gradient-to-br from-[#e8f0f8] to-[#dce8f4]`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 5h11l-1.5 3L17 11H4V5Z"
            stroke="#0b6bcb"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M4 5v14"
            stroke="#05325c"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (type === "city") {
    return (
      <span className={`${common} bg-gradient-to-br from-[#eef6ff] to-[#e0ecfa]`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
            stroke="#0b6bcb"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="11" r="2" fill="#0b6bcb" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${common} bg-gradient-to-br from-[#dff0ff] to-[#cfe6fb]`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10.5 12.5 3.8 14.2l.7-1.8 5.2-1.2L4 6.5l1.5-.7 7.2 3.6L16.5 3l1.6.5-1.3 7.8 4.7 2.2-.6 1.5-6.3-.8-1.8 4.8-1.7-.3 1.4-5.7Z"
          fill="#0b6bcb"
        />
      </svg>
    </span>
  );
}

export function LocationField({
  label,
  valueCode,
  displayValue,
  onSelect,
  onDisplayChange,
  onClearCode,
  placeholder = "Negara, kota, atau bandara",
  className = "",
  menuAlign = "start",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LocationSuggestion[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggest = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/locations/suggest?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      setItems((data.suggestions as LocationSuggestion[]) ?? []);
      setActive(0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function scheduleFetch(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggest(q);
    }, 120);
  }

  function pick(loc: LocationSuggestion) {
    onSelect(loc);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      scheduleFetch(displayValue);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showHint = !displayValue.trim();

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-white/75">
        {label}
      </span>
      <div
        className={`flex min-h-[52px] items-center gap-1.5 rounded-xl border border-transparent bg-white py-1.5 pl-3 pr-2 transition ${
          open ? "shadow-[0_0_0_3px_rgba(11,107,203,0.35)]" : ""
        }`}
      >
        <input
          value={displayValue}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={label}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 truncate border-0 bg-transparent py-2 text-[15px] font-bold text-ink outline-none placeholder:font-semibold placeholder:text-muted/70"
          onFocus={() => {
            setOpen(true);
            void fetchSuggest(displayValue);
          }}
          onChange={(e) => {
            onDisplayChange(e.target.value);
            onClearCode();
            setOpen(true);
            scheduleFetch(e.target.value);
          }}
          onKeyDown={onKeyDown}
        />
        {valueCode ? (
          <span className="shrink-0 rounded-md bg-[#e8f2fc] px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-brand">
            {valueCode}
          </span>
        ) : null}
        {displayValue || valueCode ? (
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-[#eef3f8] hover:text-ink"
            aria-label={`Hapus ${label}`}
            onClick={() => {
              onDisplayChange("");
              onClearCode();
              setOpen(true);
              void fetchSuggest("");
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M2 2l8 8M10 2 2 10"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className={`absolute z-[60] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line/80 bg-white shadow-[0_20px_50px_rgba(2,24,46,0.28)] ${
            menuAlign === "end" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line/70 bg-[#f7fafc] px-3.5 py-2.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
              {showHint ? "Populer" : "Hasil pencarian"}
            </p>
            {loading ? (
              <span className="text-[11px] font-semibold text-brand">…</span>
            ) : (
              <span className="text-[11px] font-semibold text-muted">
                {items.length} opsi
              </span>
            )}
          </div>

          <ul
            id={listId}
            role="listbox"
            className="max-h-[min(20rem,50vh)] overflow-y-auto overscroll-contain py-1.5"
          >
            {loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted">
                Mencari lokasi…
              </li>
            ) : items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted">
                Tidak ada hasil. Coba kota atau kode bandara.
              </li>
            ) : (
              items.map((loc, i) => {
                const selected = i === active;
                return (
                  <li key={loc.id} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                        selected
                          ? "bg-[#e8f2fc]"
                          : "hover:bg-[#f4f8fc]"
                      }`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pick(loc)}
                    >
                      <TypeIcon type={loc.type} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-extrabold leading-snug text-ink">
                          {shortLocationLabel(loc)}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-muted">
                          <span className="truncate">{loc.subtitle}</span>
                          <span className="shrink-0 text-line">·</span>
                          <span className="shrink-0">{typeLabel(loc.type)}</span>
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-extrabold tracking-wide ${
                          selected
                            ? "bg-brand text-white"
                            : "bg-[#eef3f8] text-brand-deep"
                        }`}
                      >
                        {loc.code}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

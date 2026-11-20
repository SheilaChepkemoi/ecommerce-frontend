"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { adminNavigation } from "@/components/shared/AdminNavigation";

export default function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // Pages matching the query.
  // Later: also fetch products and orders from your Java API and add them here.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminNavigation.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  // Ctrl/Cmd + K toggles the palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((isOpen) => !isOpen);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Start fresh every time it opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="admin-icon-btn admin-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <FiSearch size={18} aria-hidden="true" />
        <span className="d-none d-lg-inline">Search</span>
        <kbd className="admin-kbd d-none d-lg-inline">Ctrl K</kbd>
      </button>

      {/* Rendered in document.body so it sits above the sidebar and header */}
      {open &&
        createPortal(
          <div
            className="admin-palette-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="admin-palette" role="dialog" aria-modal="true" aria-label="Search">
              <div className="admin-palette-input">
                <FiSearch size={18} aria-hidden="true" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  placeholder="Search pages…"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="admin-palette-list"
                  aria-activedescendant={results[active] ? `admin-palette-item-${active}` : undefined}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKeyDown}
                />
                <kbd className="admin-kbd">Esc</kbd>
              </div>

              <ul id="admin-palette-list" role="listbox" className="admin-palette-list">
                {results.length === 0 ? (
                  <li className="admin-palette-empty">No results for “{query}”</li>
                ) : (
                  results.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.href}
                        id={`admin-palette-item-${i}`}
                        role="option"
                        aria-selected={i === active}
                        className="admin-palette-item"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(item.href)}
                      >
                        <Icon size={18} aria-hidden="true" />
                        {item.label}
                      </li>
                    );
                  })
                )}
              </ul>

              <p className="admin-palette-hint">
                Searching pages.
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
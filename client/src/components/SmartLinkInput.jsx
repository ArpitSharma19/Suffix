import React, { useEffect, useRef, useState } from "react";
import { listPages, listSectionsForPage, numberSections } from "../utils/pageRegistry";

const keyCodes = { up: 38, down: 40, enter: 13, esc: 27 };

export default function SmartLinkInput({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const val = value || "";

  useEffect(() => {
    const init = async () => {
      if (!val.startsWith("/")) {
        setOpen(false);
        return;
      }
      const hasTrailingSlash = val.endsWith("/");
      const parts = val.split("/").filter(Boolean);
      if (parts.length === 0) {
        const pages = await listPages();
        setItems(pages.map((p) => ({ key: p.slug, label: `/${p.slug}` })));
        setActive(0);
        setOpen(true);
      } else if (parts.length === 1 && !hasTrailingSlash) {
        const pages = await listPages();
        const filtered = pages.filter((p) => p.slug.toLowerCase().startsWith(parts[0].toLowerCase()));
        setItems(filtered.map((p) => ({ key: p.slug, label: `/${p.slug}` })));
        setActive(0);
        setOpen(true);
      } else {
        const page = parts[0];
        const all = await listSectionsForPage(page);
        const numbered = numberSections(all);
        const secPrefix = parts[1] || "";
        const filtered = numbered.filter((s) => s.id.toLowerCase().startsWith(secPrefix.toLowerCase()));
        setItems(filtered.map((s) => ({ key: s.id, label: `/${page}/${s.id}` })));
        setActive(0);
        setOpen(true);
      }
    };
    init();
  }, [val]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.keyCode === keyCodes.down) {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.keyCode === keyCodes.up) {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.keyCode === keyCodes.enter) {
      e.preventDefault();
      const item = items[active];
      if (!item) return;
      onChange(item.label);
      if (onSelect) onSelect(item.label);
      setOpen(false);
      setItems([]);
      setActive(0);
    } else if (e.keyCode === keyCodes.esc) {
      setOpen(false);
      setItems([]);
      setActive(0);
    }
  };

  const handleClick = (label) => {
    onChange(label);
    if (onSelect) onSelect(label);
    setOpen(false);
    setItems([]);
    setActive(0);
  };

  return (
    <div className="smart-link-input" style={{ position: "relative" }}>
      <input
        ref={inputRef}
        className="form-control"
        value={val}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (val.startsWith("/")) setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
        }}
        placeholder="Type / to link"
      />
      {open && items.length > 0 && (
        <div
          className="dropdown-menu show"
          style={{ width: "100%", maxHeight: 240, overflowY: "auto" }}
        >
          {items.map((it, idx) => (
            <button
              key={it.key}
              className={`dropdown-item ${idx === active ? "active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleClick(it.label);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

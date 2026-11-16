import { useEffect, useId, useRef, useState } from "react";

export default function FilterSelect({ label, value, options, onChange, focusId, primary = false }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const listId = useId();
  const selected = options.find(option => String(option.id) === String(value)) || options[0];

  useEffect(() => {
    if (!open) return;
    const option = root.current.querySelector('[aria-selected="true"]');
    option?.focus({ preventScroll: true });
    option?.scrollIntoView({ block: "nearest", inline: "nearest" });
    const outside = event => {
      if (!root.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current.focus({ preventScroll: true });
  }

  function handleKey(event) {
    if (!open) return;
    if (["Escape", "GoBack", "BrowserBack", "Backspace"].includes(event.key) || event.keyCode === 461) {
      event.preventDefault();
      close();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const items = [...root.current.querySelectorAll('[role="option"]')];
      const current = items.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 :
        Math.max(0, Math.min(items.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)));
      items[next].focus({ preventScroll: true });
      items[next].scrollIntoView({ block: "nearest", inline: "nearest" });
    } else if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="filter-select" ref={root} onKeyDown={handleKey}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <button type="button" className="filter-trigger" ref={trigger}
        data-tv-focus data-focus-id={focusId} data-page-focus={primary || undefined}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
        onClick={() => setOpen(!open)}>
        <span className="filter-label">{label}</span>
        <span>{selected?.name} <span aria-hidden="true">▾</span></span>
      </button>
      {open && <div className="filter-options" role="listbox" aria-label={label} id={listId}>
        {options.map(option => <button type="button" role="option" tabIndex={-1}
          aria-selected={String(option.id) === String(value)} key={option.id}
          onClick={() => { close(); onChange(String(option.id)); }}>
          {option.name}
        </button>)}
      </div>}
    </div>
  );
}

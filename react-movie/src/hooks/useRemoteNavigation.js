import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

const selector = "[data-tv-focus]";
const arrows = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
const legacyKeys = { 13: "Enter", 27: "Escape", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 461: "BrowserBack" };
const backKeys = ["Escape", "GoBack", "BrowserBack", "Backspace"];

function available(node) {
  return !node.disabled && !node.closest('[hidden], [aria-hidden="true"]') &&
    node.getClientRects().length > 0 && getComputedStyle(node).visibility !== "hidden";
}

function focus(node) {
  if (!node) return;
  node.focus({ preventScroll: true });
  // Native scrolling follows focus even during held/repeated remote keys.
  // No smooth animations queue up on lower-powered TV hardware.
  node.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
}

function horizontallyVisible(node) {
  const rail = node.closest("[data-focus-row]");
  if (!rail) return true;
  const rect = node.getBoundingClientRect();
  const bounds = rail.getBoundingClientRect();
  return rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2;
}

function nextTarget(current, key, targets) {
  const horizontal = key === "ArrowLeft" || key === "ArrowRight";
  const forward = key === "ArrowRight" || key === "ArrowDown";
  const row = current.closest("[data-focus-row]");
  if (horizontal && row) {
    const siblings = targets.filter(node => node.closest("[data-focus-row]") === row);
    const next = siblings[siblings.indexOf(current) + (forward ? 1 : -1)];
    if (next || row.hasAttribute("data-focus-lock")) return next;
  }

  const from = current.getBoundingClientRect();
  const x = from.left + from.width / 2;
  const y = from.top + from.height / 2;
  return targets.filter(node => node !== current && horizontallyVisible(node))
    .map(node => {
      const to = node.getBoundingClientRect();
      const dx = to.left + to.width / 2 - x;
      const dy = to.top + to.height / 2 - y;
      const distance = horizontal ? dx : dy;
      const cross = horizontal ? dy : dx;
      const sameRow = !horizontal && row && node.closest("[data-focus-row]") === row;
      const valid = !sameRow && (forward ? distance > 8 : distance < -8);
      const score = horizontal ? Math.abs(distance) + Math.abs(cross) * 4 : Math.abs(distance) * 4 + Math.abs(cross);
      return { node, score: valid ? score : Infinity };
    }).filter(item => Number.isFinite(item.score))
    .sort((a, b) => a.score - b.score)[0]?.node;
}

export default function useRemoteNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const memory = useRef(new Map());
  const previousPath = useRef(null);
  const tvOverride = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const forced = new URLSearchParams(location.search).get("tv");
    if (forced === "1" || forced === "0") tvOverride.current = forced === "1";
    const detectedTV = /AFT|FireTV|Fire TV|Silk\/|Android TV|SmartTV|Tizen|Web0S/i.test(navigator.userAgent);
    if (tvOverride.current ?? detectedTV) {
      root.dataset.tv = "true";
    } else delete root.dataset.tv;
    const remote = () => root.dataset.tv === "true" || root.dataset.input === "remote";
    const saved = navigationType === "POP" ? memory.current.get(location.key) : null;
    const changedPage = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    let pending = Boolean(saved) || changedPage;
    let lastId = saved?.id;
    const positions = memory.current;

    const restore = () => {
      if (!remote()) return;
      const targets = [...document.querySelectorAll(selector)].filter(available);
      if (!targets.length) return;
      if (!pending && document.activeElement !== document.body) return;
      const remembered = saved?.id && targets.find(node => node.dataset.focusId === saved.id);
      if (saved?.id && !remembered && document.querySelector('[aria-busy="true"]')) return;
      const pageStart = targets.find(node => node.hasAttribute("data-page-focus"));
      if (!remembered && !pageStart && document.querySelector('[aria-busy="true"]')) return;
      const preferred = remembered || pageStart ||
        document.querySelector('.nav-link[aria-current="page"]') || targets[0];
      pending = false;
      if (remembered) window.scrollTo(0, saved.y);
      focus(preferred);
    };

    const onFocus = event => {
      const node = event.target.closest?.(selector);
      if (node) {
        lastId = node.dataset.focusId;
        if (remote()) node.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
      }
    };

    const onKeyDown = event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      const key = event.key && event.key !== "Unidentified" ? event.key : legacyKeys[event.keyCode];
      const active = document.activeElement;
      const editing = active?.matches('input, textarea, select, [contenteditable="true"]');
      if (editing && !["ArrowUp", "ArrowDown", "Escape", "GoBack", "BrowserBack"].includes(key)) return;

      if (backKeys.includes(key)) {
        event.preventDefault();
        if (event.repeat) return;
        if (editing) {
          focus(document.querySelector('.nav-link[aria-current="page"]'));
        } else if (location.pathname !== "/") {
          if (window.history.state?.idx > 0) navigate(-1);
          else navigate(location.pathname.endsWith("/stream") ? location.pathname.replace(/\/stream$/, "") : "/");
        } else {
          focus(document.querySelector('.nav-link[aria-current="page"]'));
        }
        return;
      }

      if (key === "Select") {
        event.preventDefault();
        if (!event.repeat) active?.click();
        return;
      }
      if (!arrows.includes(key) || active?.tagName === "SELECT") return;
      root.dataset.input = "remote";
      event.preventDefault();
      const targets = [...document.querySelectorAll(selector)].filter(available);
      if (!targets.includes(active)) {
        pending = true;
        restore();
      } else {
        pending = false;
        focus(nextTarget(active, key, targets));
      }
    };

    const onPointer = () => { delete root.dataset.input; pending = false; };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("pointerdown", onPointer);
    const observer = new MutationObserver(restore);
    observer.observe(document.getElementById("root"), { childList: true, subtree: true });
    const frame = requestAnimationFrame(restore);
    return () => {
      positions.set(location.key, { id: lastId, y: window.scrollY });
      // Keep navigation memory bounded during long browsing sessions.
      if (positions.size > 50) positions.delete(positions.keys().next().value);
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [location.key, location.pathname, location.search, navigate, navigationType]);
}

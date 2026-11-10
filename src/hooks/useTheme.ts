"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "ss-theme";

/**
 * Inline script for <head>: applies the saved theme before first paint so the
 * page never flashes the wrong colours. Light is the default.
 */
/**
 * Some browser extensions (form fillers / password managers) stamp an
 * `fdprocessedid` attribute onto every button and input before React hydrates,
 * which triggers a hydration-mismatch warning. Strip it for the first few
 * seconds so the server and client markup match.
 */
export const EXTENSION_ATTR_SCRIPT = `(function(){try{var A=['fdprocessedid','bis_skin_checked','__processed'];var clean=function(n){for(var i=0;i<A.length;i++){if(n.hasAttribute&&n.hasAttribute(A[i]))n.removeAttribute(A[i]);}};var mo=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==='attributes')clean(m.target);else for(var j=0;j<m.addedNodes.length;j++){var n=m.addedNodes[j];if(n.nodeType===1){clean(n);var q=n.querySelectorAll('['+A.join('],[')+']');for(var k=0;k<q.length;k++)clean(q[k]);}}}});mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:A});setTimeout(function(){mo.disconnect();},8000);}catch(e){}})();`;

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

function read(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/** Current theme (reactive) plus a setter that persists the choice. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, read, () => "light");

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage blocked — theme still applies for this visit */
    }
    window.setTimeout(() => root.classList.remove("theme-switching"), 400);
  }, []);

  const toggle = useCallback(
    () => setTheme(read() === "dark" ? "light" : "dark"),
    [setTheme],
  );

  return { theme, setTheme, toggle };
}

import { Nullable } from "../types";

function isElementActive(element: HTMLElement) {
  if (!element) return false;
  if (element.hasAttribute("disabled")) return false;
  if (element.getAttribute("aria-disabled") === "true") return false;
  return true;
}

export async function waitForStableElement<T extends HTMLElement>(selector: string, root: ParentNode = document.body, timeoutMs = 5000, settleMs = 100) {
  return new Promise<T>((resolve, reject) => {
    const existing = root.querySelector(selector) as Nullable<T>;
    if (existing && isElementActive(existing)) return setTimeout(() => resolve(existing), settleMs);

    let lastMatch: T;
    const observer = new MutationObserver(() => {
      const element = root.querySelector(selector) as Nullable<T>;
      if (element && element !== lastMatch && isElementActive(element)) {
        lastMatch = element;
        setTimeout(() => {
          const now = root.querySelector(selector) as Nullable<T>;
          if (now === element && isElementActive(now)) {
            clearTimeout(timeoutTimer);
            observer.disconnect();
            resolve(now);
          }
        }, settleMs);
      }
    });
    observer.observe(root, { childList: true, subtree: true });

    const timeoutTimer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for selector: ${selector}`));
    }, timeoutMs);
  });
}

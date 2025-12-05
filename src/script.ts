import { tryCatchAsync } from "utility-kit";
import { waitForStableElement } from "./lib/dom";
import { Nullable } from "./types";

function assignFileToInput(input: HTMLInputElement, file: File) {
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function handlePaste(e: ClipboardEvent) {
  const { success, error } = await tryCatchAsync(async () => {
    const items = e.clipboardData?.items;
    if (!items?.length) return;

    const last = items[items.length - 1];
    if (!last.type.startsWith("image/")) return;

    e.preventDefault();

    const file = last.getAsFile();
    if (!file) return;

    const imageButton = await waitForStableElement('span.tool[rel="file"].oo-ui-buttonWidget > a');
    imageButton.click();

    const uploadButtonContainer = await waitForStableElement("div.ui-dialog > div.ui-dialog-buttonpane > div.ui-dialog-buttonset");
    const uploadButton = Array.from(uploadButtonContainer.querySelectorAll("button")).find((btn) => {
      const span = btn.querySelector("span");
      return span?.textContent.trim() === "Upload";
    });
    if (!uploadButton) return;

    const windowManagers = document.querySelectorAll("div.oo-ui-windowManager");
    windowManagers.forEach((wm) => wm.remove());
    uploadButton.click();

    const windowManager = await waitForStableElement<HTMLDivElement>("div.oo-ui-windowManager");
    const input = await waitForStableElement<HTMLInputElement>('input[type="file"]', windowManager);
    assignFileToInput(input, file);

    const checkBox = await waitForStableElement('form.oo-ui-formLayout input[type="checkbox"]');
    checkBox.click();

    const actionButton = await waitForStableElement<HTMLAnchorElement>("div.oo-ui-processDialog-actions-primary a", windowManager);
    if (actionButton.textContent.trim() !== "Upload") return;

    actionButton.click();

    const name = await waitForStableElement<HTMLInputElement>("input.oo-ui-inputWidget-input", windowManager);
    const description = await waitForStableElement<HTMLTextAreaElement>("textarea.oo-ui-textInputWidget-autosized", windowManager);
    description.value = name.value;
    description.dispatchEvent(new Event("change", { bubbles: true }));
  });

  if (!success) console.error(error);
}

function initObserver() {
  const observer = new MutationObserver(() => {
    const textarea = document.querySelector("textarea[aria-label='Wikitext source editor']") as Nullable<HTMLTextAreaElement>;
    if (textarea && !textarea.dataset.pasteBound) {
      textarea.dataset.pasteBound = "1";
      textarea.addEventListener("paste", handlePaste, { capture: true });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initObserver);
else initObserver();

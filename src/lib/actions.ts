export function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function legacyCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export async function copyText(text: string) {
  // The legacy path runs synchronously inside the click, so it works where the async
  // Clipboard API is blocked (plain-HTTP origins, embedded browsers, strict policies).
  if (legacyCopy(text)) return;
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error("Copy failed");
}

export async function shareOrCopy(title: string, url: string) {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      /* user cancelled or share failed — fall through to copy */
    }
  }
  await copyText(url);
  return "copied";
}

export function recordFileStub(title: string, body: string) {
  return `${title}\n\n${body}\n\n— Dhruva Polar Knowledge Portal (demonstration file)`;
}

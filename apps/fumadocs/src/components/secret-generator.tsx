"use client";
import * as React from "react";

function generateHexSecret(byteLength: number = 32): string {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(byteLength);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback (non-crypto) if window.crypto is unavailable
  let out = "";
  for (let i = 0; i < byteLength; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

export function SecretGenerator({
  label = "Generate Secret",
  bytes = 32,
}: {
  label?: string;
  bytes?: number;
}) {
  const [secret, setSecret] = React.useState<string>("");
  const [copied, setCopied] = React.useState<boolean>(false);

  const onGenerate = React.useCallback(() => {
    const s = generateHexSecret(bytes);
    setSecret(s);
    setCopied(false);
  }, [bytes]);

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [secret]);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onGenerate}
          className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {label}
        </button>
        {secret && (
          <button
            type="button"
            onClick={onCopy}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <code className="break-all text-sm bg-muted p-3 rounded">
        {secret ||
          "Click Generate to create a secure secret (64 hex chars by default)."}
      </code>
      <div className="text-xs text-muted-foreground">
        Keep this secret safe. Use the same value in your server env and the
        plugin config.
      </div>
    </div>
  );
}

export default SecretGenerator;

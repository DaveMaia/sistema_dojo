'use client';

import { useState } from 'react';

interface PixCopyProps {
  payload: string;
}

export function PixCopy({ payload }: PixCopyProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">Pix Copia e Cola</p>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
        {payload}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
          copied ? 'bg-emerald-400 text-slate-950' : 'bg-primary text-slate-950'
        }`}
      >
        {copied ? 'Código copiado!' : 'Copiar código'}
      </button>
    </div>
  );
}

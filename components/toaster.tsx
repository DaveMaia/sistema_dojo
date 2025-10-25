'use client';

import { ReactNode, useEffect, useState } from 'react';

export function Toaster(): ReactNode {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: CustomEvent<string>) => {
      setMessage(event.detail);
      setTimeout(() => setMessage(null), 4000);
    };

    window.addEventListener('app:toast', handler as EventListener);
    return () => window.removeEventListener('app:toast', handler as EventListener);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 flex justify-center">
      <div className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg shadow-lg text-sm">
        {message}
      </div>
    </div>
  );
}

export function showToast(text: string) {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: text }));
}

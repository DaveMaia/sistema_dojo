'use client';

import { useEffect, useRef, useState } from 'react';

export function AttendanceScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Aponte a câmera para o QR Code do aluno.');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame = 0;
    let detector: BarcodeDetector | null = null;
    let isCheckingIn = false;

    async function startScanner() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('scanning');

        if ('BarcodeDetector' in window) {
          detector = new BarcodeDetector({ formats: ['qr_code'] });
        } else {
          setMessage('Seu navegador não suporta leitor de QR. Use um dispositivo moderno.');
          return;
        }

        animationFrame = requestAnimationFrame(scan);
      } catch {
        setStatus('error');
        setMessage('Permissão negada ou câmera indisponível.');
      }
    }

    async function scan() {
      if (!videoRef.current || !detector || isCheckingIn) return;
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length) {
        const token = barcodes[0]?.rawValue;
        if (token) {
          await checkIn(token);
          return;
        }
      }
      animationFrame = requestAnimationFrame(scan);
    }

    async function checkIn(token: string) {
      isCheckingIn = true;
      setStatus('scanning');
      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Check-in realizado! Level up!');
        setTimeout(() => {
          setStatus('scanning');
          setMessage('Aponte a câmera para o próximo QR Code.');
          isCheckingIn = false;
          animationFrame = requestAnimationFrame(scan);
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Falha ao validar o QR. Tente novamente.');
        isCheckingIn = false;
        animationFrame = requestAnimationFrame(scan);
      }
    }

    startScanner();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
        <video ref={videoRef} autoPlay playsInline className="h-72 w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-40 rounded-2xl border-2 border-primary/80 shadow-[0_0_30px_rgba(56,189,248,0.35)]" />
        </div>
        {status === 'success' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
            <span className="animate-pulse text-lg font-semibold text-emerald-200">LEVEL UP</span>
          </div>
        ) : null}
      </div>
      <div
        className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
          status === 'error'
            ? 'border-red-500/40 bg-red-500/10 text-red-200'
            : 'border-slate-800 bg-slate-950/60 text-slate-300'
        }`}
      >
        {message}
      </div>
    </div>
  );
}

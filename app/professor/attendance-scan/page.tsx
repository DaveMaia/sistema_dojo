import Link from 'next/link';
import { AttendanceScanner } from '../ui/attendance-scanner';

export default function AttendanceScanPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Scanner de Presença</p>
          <h1 className="text-2xl font-semibold">Check-in por QR Code</h1>
          <p className="text-sm text-slate-400">
            Use a câmera do celular para validar a presença dos alunos.
          </p>
        </div>
        <Link href="/professor" className="text-xs text-primary underline">
          Voltar ao painel
        </Link>
      </header>
      <AttendanceScanner />
    </div>
  );
}

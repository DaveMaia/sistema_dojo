export interface AutoBadgeResult {
  nome: string;
  descricao: string;
  criterio: string;
}

export function evaluateAutoBadges(attendanceRate: number): AutoBadgeResult[] {
  const results: AutoBadgeResult[] = [];
  if (attendanceRate >= 0.9) {
    results.push({
      nome: 'Inabalável',
      descricao: 'Presença acima de 90% no mês.',
      criterio: 'attendance_rate>=0.9',
    });
  }
  if (attendanceRate >= 0.75 && attendanceRate < 0.9) {
    results.push({
      nome: 'Disciplina de Aço',
      descricao: 'Presença acima de 75% no mês.',
      criterio: 'attendance_rate>=0.75',
    });
  }
  return results;
}

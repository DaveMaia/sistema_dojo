const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatDate(input: string | Date | null | undefined) {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  return dateFormatter.format(date);
}

export function formatCurrency(value: number | null | undefined) {
  if (!value) return currencyFormatter.format(0);
  return currencyFormatter.format(value / 100);
}

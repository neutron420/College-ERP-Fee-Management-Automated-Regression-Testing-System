export function toDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

export function diffInDays(start: Date | string, end: Date | string): number {
  const d1 = toDate(start);
  const d2 = toDate(end);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateOverdueDays(
  dueDate: Date | string,
  graceDays = 0,
  calculationDate: Date | string = new Date()
): number {
  const due = toDate(dueDate);
  const calc = toDate(calculationDate);
  const daysDiff = diffInDays(due, calc);
  if (daysDiff <= graceDays) return 0;
  return daysDiff;
}

export function isPastDue(
  dueDate: Date | string,
  graceDays = 0,
  calculationDate: Date | string = new Date()
): boolean {
  return calculateOverdueDays(dueDate, graceDays, calculationDate) > 0;
}

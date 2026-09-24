/**
 * Financial rounding utility using standard Half-Up arithmetic
 * Avoids IEEE-754 floating-point drift (e.g., 0.1 + 0.2 !== 0.3)
 */
export function roundMoney(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function addMoney(a: number, b: number): number {
  return roundMoney(roundMoney(a) + roundMoney(b));
}

export function subtractMoney(a: number, b: number): number {
  return roundMoney(roundMoney(a) - roundMoney(b));
}

export function multiplyMoney(amount: number, factor: number): number {
  return roundMoney(roundMoney(amount) * factor);
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

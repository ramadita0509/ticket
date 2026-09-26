export function formatMoney(amount: string | number, currency: string): string {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(value)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IDR" ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${amount}`;
  }
}

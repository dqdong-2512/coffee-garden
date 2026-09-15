import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}
export function currency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}
export const formatVnd = currency;
export function compact(value: number) {
  return `${Number((value / 1000000).toFixed(1))}m`;
}

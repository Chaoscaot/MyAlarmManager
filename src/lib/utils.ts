import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T, K extends keyof T>(
  xs: T[],
  key: K,
): Record<string, T[]> {
  return xs.reduce(
    function (rv, x) {
      const keyValue = String(x[key]);
      (rv[keyValue] ??= []).push(x);
      return rv;
    },
    {} as Record<string, T[]>,
  );
}

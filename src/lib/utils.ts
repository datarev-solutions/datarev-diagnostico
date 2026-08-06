import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn's class helper: merges conditional classes and resolves conflicting
 * Tailwind utilities so a later class wins over an earlier one.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

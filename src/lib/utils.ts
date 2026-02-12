import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names (e.g. Tailwind CSS utilities) and resolves conflicts.
 * Uses clsx to merge strings, objects, and arrays into a single class string (falsy values are omitted).
 * Uses tailwind-merge so that later classes override earlier ones when they target the same utility
 * (e.g. "p-2" and "p-4" → only "p-4" is kept).
 * @param inputs - Class names: strings, objects, arrays, or conditional expressions (undefined/null are ignored).
 * @returns A single class string suitable for the className prop.
 */
export function mergeClasses(...inputs: ClassValue[])
{
  return twMerge(clsx(inputs))
}

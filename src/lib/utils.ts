import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const APP_NAME = 'Inventory Scanner';
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.example.com/inventory-app';

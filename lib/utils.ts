import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function formatSalary(amount: string, currency: string): string {
  if (!amount) return "Negotiable"
  return `${currency} ${amount}`
}

export function truncate(text: string, length: number): string {
  if (!text) return ""
  return text.length > length ? text.slice(0, length) + "..." : text
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
}
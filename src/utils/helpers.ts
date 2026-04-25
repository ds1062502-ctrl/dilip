import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function openWhatsApp(phone: string, message: string) {
  // Remove non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Add country code if missing (assuming India +91)
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${fullPhone}?text=${encodedMessage}`, '_blank');
}

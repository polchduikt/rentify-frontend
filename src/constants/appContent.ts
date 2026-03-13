import { Home, Search, Shield, Sparkles } from 'lucide-react';

export const APP_CONTENT = {
  companyName: 'Rentify',
  tagline: 'Зручна платформа для короткострокової та довгострокової оренди.',
  contacts: {
    phone: '+380 (97) 000 00 00',
    email: 'info@rentify.app',
    location: 'Україна',
  },
  socialLinks: {
    facebook: 'https://www.facebook.com',
    instagram: 'https://www.instagram.com',
    youtube: 'https://www.youtube.com',
  },
} as const;

export const HERO_CITIES = ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро', 'Запоріжжя'] as const;

export const FEATURES = [
  {
    icon: Search,
    title: 'Потужний пошук',
    description: 'Фільтруйте за ціною, районом, типом оренди та зручностями за секунди.',
    colorClass: 'bg-blue-50 text-blue-700',
  },
  {
    icon: Shield,
    title: 'Надійні оголошення',
    description: 'Модеровані об’єкти та прозора інформація про власників.',
    colorClass: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Sparkles,
    title: 'Кращий досвід',
    description: 'Швидкий процес бронювання з прозорою ціною та комунікацією.',
    colorClass: 'bg-amber-50 text-amber-700',
  },
  {
    icon: Home,
    title: 'Для власників',
    description: 'Публікуйте та керуйте нерухомістю у структурованих інструментах.',
    colorClass: 'bg-violet-50 text-violet-700',
  },
] as const;

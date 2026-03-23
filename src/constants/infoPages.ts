import { BookOpenCheck, Globe2, LifeBuoy, Mail, MessageCircle, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { APP_CONTENT } from '@/constants/appContent';

export const ABOUT_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Безпека та довіра',
    description: 'Модерація оголошень, перевірка контенту та прозорі правила взаємодії між орендарями та власниками.',
  },
  {
    icon: Sparkles,
    title: 'Зручний досвід',
    description: 'Швидкий пошук, фільтри, карта та простий шлях від першого кліку до підтвердженого бронювання.',
  },
  {
    icon: Globe2,
    title: 'Фокус на Україні',
    description: 'Розвиваємо сервіс під реальні потреби українських міст, громад та локального ринку оренди.',
  },
] as const;

export const ABOUT_STATS = [
  { value: '14 000+', label: 'активних оголошень на платформі' },
  { value: '180+', label: 'міст і громад у каталозі' },
  { value: '24/7', label: 'підтримка для користувачів' },
] as const;

const SUPPORT_PHONE_HREF = `tel:${APP_CONTENT.contacts.phone.replace(/\s|\(|\)|-/g, '')}`;

export const CONTACT_CHANNELS = [
  {
    icon: Phone,
    title: 'Телефон',
    value: APP_CONTENT.contacts.phone,
    description: 'Пн-Нд: 09:00 - 21:00',
    href: SUPPORT_PHONE_HREF,
    actionLabel: 'Зателефонувати',
  },
  {
    icon: Mail,
    title: 'Email',
    value: APP_CONTENT.contacts.email,
    description: 'Відповідаємо зазвичай до 2 годин',
    href: `mailto:${APP_CONTENT.contacts.email}`,
    actionLabel: 'Написати лист',
  },
  {
    icon: MessageCircle,
    title: 'Онлайн-чат',
    value: 'Чат у кабінеті Rentify',
    description: 'Швидка допомога з бронюванням та оголошеннями',
    href: ROUTES.profile,
    actionLabel: 'Відкрити чат',
  },
] as const;

export const SUPPORT_TOPICS = [
  {
    icon: LifeBuoy,
    title: 'Проблеми з бронюванням',
    description: 'Оплата, підтвердження заявки, скасування та повернення коштів.',
  },
  {
    icon: MessageCircle,
    title: 'Оголошення та модерація',
    description: 'Статуси оголошень, редагування, архів і питання щодо правил публікації.',
  },
  {
    icon: BookOpenCheck,
    title: 'Профіль і безпека',
    description: 'Доступ до акаунта, налаштування безпеки, відновлення входу.',
  },
] as const;

export const SUPPORT_FAQ = [
  {
    question: 'Як швидко відповідає підтримка?',
    answer: 'У чаті та пошті зазвичай відповідаємо протягом 15-120 хвилин у робочий час.',
  },
  {
    question: 'Куди звертатись, якщо не проходить оплата?',
    answer: 'Напишіть у підтримку з ID бронювання або оголошення. Ми перевіримо транзакцію та статус платежу.',
  },
  {
    question: 'Чому оголошення не показується в пошуку?',
    answer: 'Перевірте статус оголошення: опубліковане, чернетка або архів. У пошуку показуються лише опубліковані.',
  },
  {
    question: 'Що робити, якщо потрібна термінова допомога?',
    answer: 'Для критичних випадків використовуйте телефон підтримки. Так ви отримаєте найшвидший контакт з оператором.',
  },
] as const;

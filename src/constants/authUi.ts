export const LOGIN_PAGE_HERO = {
  photoUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=90',
  imageAlt: 'Інтерʼєр квартири',
  overlayClassName: 'bg-gradient-to-b from-slate-900/65 via-slate-900/35 to-slate-900/75',
  eyebrow: 'Понад 2 000 перевірених оголошень',
  title: 'Знайдіть житло, яке стане домом',
  featuredCities: ['Київ', 'Львів', 'Одеса', 'Харків'] as const,
};

export const REGISTER_PAGE_HERO = {
  photoUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=90',
  imageAlt: 'Інтерʼєр квартири',
  overlayClassName: 'bg-gradient-to-b from-blue-900/60 via-blue-800/30 to-slate-900/70',
  eyebrow: 'Приєднуйтесь до спільноти',
  title: 'Оренда без зайвих клопотів',
  perks: [
    'Безкоштовне розміщення оголошень',
    'Прямий контакт з власниками',
    'Перевірені обʼєкти нерухомості',
    'Захищені угоди та платежі',
  ] as const,
};

export const PASSWORD_STRENGTH_LABELS = ['', 'Слабкий', 'Середній', 'Добрий', 'Надійний'] as const;
export const PASSWORD_STRENGTH_COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'] as const;

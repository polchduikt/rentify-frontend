import { ROUTES } from '@/config/routes';

export const FOOTER_LINKS: Record<string, Array<{ label: string; to: string }>> = {
  Орендарям: [
    { label: 'Пошук оголошень', to: ROUTES.search },
    { label: 'Як це працює', to: ROUTES.about },
    { label: 'Конфіденційність', to: ROUTES.privacy },
  ],
  Власникам: [
    { label: 'Додати оголошення', to: ROUTES.createProperty },
    { label: 'Профіль', to: ROUTES.profile },
    { label: 'Умови користування', to: ROUTES.terms },
  ],
  Компанія: [
    { label: 'Про нас', to: ROUTES.about },
    { label: 'Контакти', to: ROUTES.contacts },
    { label: 'Підтримка', to: ROUTES.support },
  ],
};

import type { RentalType } from '@/types/enums';
import cityKharkivPhoto from '@/assets/images/home/city-kharkiv.jpg';
import cityKyivPhoto from '@/assets/images/home/city-kyiv.jpg';
import cityLvivPhoto from '@/assets/images/home/city-lviv.jpg';
import cityOdesaPhoto from '@/assets/images/home/city-odesa.jpg';
import heroCityPhoto from '@/assets/images/home/hero-city.jpg';
import hostPropertyPhoto from '@/assets/images/home/host-property.jpg';
import mapEntryPhoto from '@/assets/images/home/map-entry.jpg';

export const HOME_HERO_PHOTO = heroCityPhoto;
export const HOME_HOST_PHOTO = hostPropertyPhoto;
export const HOME_MAP_PHOTO = mapEntryPhoto;

export const HOME_HERO_BADGES = ['Перевірені власники', 'Швидке бронювання', 'Підтримка 24/7'] as const;

export const HOME_HERO_STATS = [
  { value: '14k+', label: 'активних оголошень' },
  { value: '180+', label: 'міст і громад' },
  { value: '4.9/5', label: 'середній рейтинг платформи' },
] as const;

export const HOME_HERO_RENTAL_OPTIONS: ReadonlyArray<{ value: RentalType; label: string }> = [
  { value: 'SHORT_TERM', label: 'Подобово' },
  { value: 'LONG_TERM', label: 'Помісячно' },
] as const;

export const HOME_POPULAR_CITIES = [
  { name: 'Київ', query: 'Київ', image: cityKyivPhoto },
  { name: 'Львів', query: 'Львів', image: cityLvivPhoto },
  { name: 'Одеса', query: 'Одеса', image: cityOdesaPhoto },
  { name: 'Харків', query: 'Харків', image: cityKharkivPhoto },
] as const;

export const HOME_WORKFLOW_STEPS = [
  {
    title: 'Шукай',
    description: 'Оберіть місто, район і формат оренди. Пошук одразу покаже релевантні оголошення.',
  },
  {
    title: 'Бронюй',
    description: 'Порівнюйте умови, ціни і зручності. Бронювання займає кілька хвилин.',
  },
  {
    title: 'Заселяйся',
    description: 'Після підтвердження керуйте бронюванням, деталями заїзду і підтримкою в одному місці.',
  },
] as const;

export const HOME_HOST_STATS = [
  { value: '₴24 000', label: 'середній дохід власника на місяць' },
  { value: '5 300+', label: 'активних власників уже з нами' },
  { value: '72 години', label: 'середній час до першої заявки' },
] as const;

export const HOME_FAQ_ITEMS = [
  {
    question: 'Як перевіряються оголошення?',
    answer:
      'Модерація перевіряє контент, фото й базову інформацію по обʼєкту. Додатково працює рейтинг власників і відгуки після завершення оренди.',
  },
  {
    question: 'Чи можу я шукати лише короткострокову оренду?',
    answer:
      'Так. У пошуку доступний фільтр формату оренди, а в hero є швидкий перемикач Подобово або Помісячно перед переходом у каталог.',
  },
  {
    question: 'Як зв’язатися з власником?',
    answer:
      'Після відкриття оголошення можна надіслати запит або написати в чаті. Історія комунікації зберігається у вашому профілі.',
  },
  {
    question: 'Чи є комісія для орендаря?',
    answer:
      'Умови залежать від конкретного оголошення. Перед бронюванням завжди видно підсумкову вартість, додаткові платежі та правила.',
  },
  {
    question: 'Як власнику швидко додати новий об’єкт?',
    answer:
      'Створіть оголошення у кілька кроків: адреса, опис, зручності, ціна та фото. Після публікації об’єкт одразу доступний у пошуку.',
  },
] as const;

import type { RentalType } from '@/types/enums';
import cityKharkivPhoto from '@/assets/images/home/city-kharkiv.jpg';
import cityIvanofrankifskPhoto from '@/assets/images/home/city-ivanofrankifsk.jpg';
import cityJitomerPhoto from '@/assets/images/home/city-jitomer.jpg';
import cityKyivPhoto from '@/assets/images/home/city-kyiv.jpg';
import cityLvivPhoto from '@/assets/images/home/city-lviv.jpg';
import cityOdesaPhoto from '@/assets/images/home/city-odesa.jpg';
import cityRivnePhoto from '@/assets/images/home/city-rivne.jpg';
import cityVinnicaPhoto from '@/assets/images/home/city-vinnica.jpg';
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
  {
    name: 'Київ',
    query: 'Київ',
    image: cityKyivPhoto,
    countQueries: ['Київ', 'Kyiv', 'Kiev'],
  },
  {
    name: 'Львів',
    query: 'Львів',
    image: cityLvivPhoto,
    countQueries: ['Львів', 'Lviv'],
  },
  {
    name: 'Одеса',
    query: 'Одеса',
    image: cityOdesaPhoto,
    countQueries: ['Одеса', 'Odesa', 'Odessa'],
  },
  {
    name: 'Харків',
    query: 'Харків',
    image: cityKharkivPhoto,
    countQueries: ['Харків', 'Kharkiv', 'Kharkov'],
  },
  {
    name: 'Вінниця',
    query: 'Вінниця',
    image: cityVinnicaPhoto,
    countQueries: ['Вінниця', 'Vinnytsia', 'Vinnitsa'],
  },
  {
    name: 'Житомир',
    query: 'Житомир',
    image: cityJitomerPhoto,
    countQueries: ['Житомир', 'Zhytomyr', 'Zhitomir'],
  },
  {
    name: 'Рівне',
    query: 'Рівне',
    image: cityRivnePhoto,
    countQueries: ['Рівне', 'Rivne', 'Rovno'],
  },
  {
    name: 'Івано-Франківськ',
    query: 'Івано-Франківськ',
    image: cityIvanofrankifskPhoto,
    countQueries: ['Івано-Франківськ', 'Івано Франківськ', 'Ivano-Frankivsk', 'Ivano Frankivsk', 'Frankivsk'],
  },
] as const;

export const HOME_WORKFLOW_STEPS = [
  {
    title: 'Шукай',
    description: 'Оберіть місто, район і формат оренди. Пошук одразу покаже релевантні оголошення.',
  },
  {
    title: 'Бронюй',
    description: 'Порівнюйте умови, ціни та зручності. Бронювання займає кілька хвилин.',
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
      'Так. У пошуку є фільтр формату оренди, а в hero доступний швидкий перемикач Подобово або Помісячно перед переходом у каталог.',
  },
  {
    question: 'Як звʼязатися з власником?',
    answer:
      'Після відкриття оголошення можна надіслати запит або написати в чаті. Історія комунікації зберігається у вашому профілі.',
  },
  {
    question: 'Чи є комісія для орендаря?',
    answer:
      'Умови залежать від конкретного оголошення. Перед бронюванням завжди видно підсумкову вартість, додаткові платежі та правила.',
  },
  {
    question: 'Як власнику швидко додати новий обʼєкт?',
    answer:
      'Створіть оголошення у кілька кроків: адреса, опис, зручності, ціна та фото. Після публікації обʼєкт одразу доступний у пошуку.',
  },
] as const;

/**
 * Тайминги секции 11. Числа и названия — из раздела «Объект», ни одного
 * выведенного значения. Порядок внутри группы — по возрастанию времени.
 *
 * Ключа Яндекс.Карт в брифе нет, поэтому интерактивной карты в секции нет
 * вовсе — ни виджета, ни заглушки под него. Ссылка на поиск по адресу ключа
 * не требует и работает без единого байта стороннего скрипта.
 */
export type Route = {
  id: string;
  /** Минуты. Число идёт в ICU-плюрал, поэтому хранится числом, а не строкой. */
  minutes: number;
  /** Уточнение под названием: «из паркинга». Есть не у всех точек. */
  note?: boolean;
};

export type RouteGroup = {
  id: "foot" | "car";
  routes: Route[];
};

export const ROUTE_GROUPS: RouteGroup[] = [
  {
    id: "foot",
    routes: [
      { id: "testovskaya", minutes: 1 },
      { id: "shelepikha", minutes: 5 },
      { id: "center", minutes: 10 },
    ],
  },
  {
    id: "car",
    routes: [
      { id: "ring", minutes: 1, note: true },
      { id: "kutuzovsky", minutes: 5 },
    ],
  },
];

/**
 * Поиск по адресу в Яндекс.Картах. Адрес русский в обеих локалях: строка
 * уходит поисковому движку, а не читателю, и по транслиту дом не находится.
 */
export const MAPS_QUERY = "Москва, улица Ермакова Роща, 1 строение 1";

export const MAPS_URL = `https://yandex.ru/maps/?text=${encodeURIComponent(MAPS_QUERY)}`;

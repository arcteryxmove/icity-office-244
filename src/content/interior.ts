/**
 * Кадры галереи. Все — из public/renders, кроме IMG_3548.PNG: он занят
 * в hero. Плана здесь нет, он не интерьер.
 *
 * Внимание: по разделу «Статус ассетов» это съёмка комплекса, а не
 * помещения 113Н. Подписи описывают только то, что видно в кадре, без
 * притяжательности и без указания на конкретное помещение.
 */
export type InteriorShot = {
  id: string;
  src: string;
  width: number;
  height: number;
};

export const INTERIOR_SHOTS: InteriorShot[] = [
  { id: "reception", src: "/renders/render_2_reception.jpg", width: 2752, height: 1536 },
  { id: "workspace", src: "/renders/IMG_3547.PNG", width: 1681, height: 936 },
  { id: "meeting", src: "/renders/IMG_3550.PNG", width: 1681, height: 936 },
  { id: "kitchen", src: "/renders/IMG_3544.PNG", width: 1672, height: 941 },
];

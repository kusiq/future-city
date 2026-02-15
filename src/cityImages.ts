/** Изображения для карточек городов (по одному на город, до 6 городов) */
import img0 from './images/2026-02-15 11.41.54.jpg';
import img1 from './images/2026-02-15 12.11.47.jpg';
import img2 from './images/2026-02-15 12.11.52.jpg';
import img3 from './images/2026-02-15 12.11.56.jpg';
import img4 from './images/2026-02-15 12.12.00.jpg';
import img5 from './images/2026-02-15 12.12.04.jpg';

export const CITY_IMAGES = [img0, img1, img2, img3, img4, img5] as const;

export function getCityImageUrl(imageIndex: number): string {
  return CITY_IMAGES[imageIndex % CITY_IMAGES.length] ?? CITY_IMAGES[0];
}

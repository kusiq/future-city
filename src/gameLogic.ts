import type { City, DevelopmentOptionId, GameEvent } from './types';
import { GOOD_EVENTS, BAD_EVENTS, MAX_LEVEL, LEVEL_THRESHOLDS } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Диапазоны наград для отображения (мин/макс; могут быть отрицательные) */
export function getDevelopmentRewardsRange(option: DevelopmentOptionId): {
  population: [number, number];
  money: [number, number];
  technologies: [number, number];
} {
  switch (option) {
    case 'economic':
      // Упор на бюджет, возможен небольшой отток населения
      return { population: [-1, 7], money: [30, 45], technologies: [0, 0] };
    case 'tech':
      // Рост технологий, возможен небольшой минус по населению
      return { population: [0, 12], money: [0, 0], technologies: [3, 5] };
    case 'infrastructure':
      // Сильный рост населения, умеренно деньги и технологии
      return { population: [14, 22], money: [5, 14], technologies: [1, 4] };
    case 'balanced':
      // Сбалансировано: население, деньги и технологии
      return { population: [4, 13], money: [6, 16], technologies: [1, 3] };
    default:
      return { population: [0, 0], money: [0, 0], technologies: [0, 0] };
  }
}

/** Награды за варианты развития (применяются в конце года) */
export function getDevelopmentRewards(
  option: DevelopmentOptionId
): { population: number; money: number; technologies: number } {
  const range = getDevelopmentRewardsRange(option);
  return {
    population: randomInt(range.population[0], range.population[1]),
    money: randomInt(range.money[0], range.money[1]),
    technologies: randomInt(range.technologies[0], range.technologies[1]),
  };
}

export function getRandomEvent(): GameEvent {
  const isGood = Math.random() < 0.5;
  const list = isGood ? GOOD_EVENTS : BAD_EVENTS;
  return list[Math.floor(Math.random() * list.length)];
}

export function applyEventToCities(cities: City[], event: GameEvent): City[] {
  return cities.map((c) => ({
    ...c,
    population: Math.max(0, c.population + event.effect.population),
    money: Math.max(0, c.money + event.effect.money),
    technologies: Math.max(0, c.technologies + event.effect.technologies),
  }));
}

export function isCityInactive(city: City): boolean {
  return city.population <= 0 || city.money <= 0 || city.technologies <= 0;
}

/** Повышает уровень города при достижении порогов населения и технологий (макс. 3). */
export function applyLevelProgress(city: City): City {
  if (city.level >= MAX_LEVEL) return city;
  for (let l = MAX_LEVEL; l >= 1; l--) {
    const t = LEVEL_THRESHOLDS[l - 1];
    if (city.population >= t.population && city.technologies >= t.technologies) {
      return { ...city, level: l };
    }
  }
  return city;
}

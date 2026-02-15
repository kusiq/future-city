export interface City {
  id: string;
  name: string;
  /** Индекс картинки в массиве (0–5), у каждого города своя */
  imageIndex: number;
  population: number; // в тысячах, отображаем как "100k"
  money: number;
  technologies: number;
  level: number;
}

export const INITIAL_POPULATION = 100;
export const INITIAL_MONEY = 100;
export const INITIAL_TECHNOLOGIES = 10;
export const INITIAL_LEVEL = 1;
export const MAX_CITIES = 6;
export const START_YEAR = 2026;
export const MAX_YEAR = 2035;
export const MONEY_PER_YEAR = 1;
export const MAX_LEVEL = 3;

/** Пороги для повышения уровня: 2–3 города могут успеть до 3 уровня при грамотной игре */
export const LEVEL_THRESHOLDS: { population: number; technologies: number }[] = [
  { population: 0, technologies: 0 },       // уровень 1 — старт
  { population: 145, technologies: 17 },   // уровень 2
  { population: 210, technologies: 26 },   // уровень 3
];

export type DevelopmentOptionId = 'economic' | 'tech' | 'infrastructure' | 'balanced';

export interface DevelopmentOptionConfig {
  id: DevelopmentOptionId;
  name: string;
  cost: number;
  description: string;
}

export const DEVELOPMENT_OPTIONS: DevelopmentOptionConfig[] = [
  {
    id: 'economic',
    name: 'Экономическое развитие',
    cost: 15,
    description: 'Развивает бюджет и население.',
  },
  {
    id: 'tech',
    name: 'Технологическое развитие',
    cost: 20,
    description: 'Развивает население и технологии.',
  },
  {
    id: 'infrastructure',
    name: 'Развитие инфраструктуры',
    cost: 15,
    description: 'Умеренно развивает бюджет, население и технологии.',
  },
  {
    id: 'balanced',
    name: 'Сбалансированное развитие',
    cost: 20,
    description: 'Развивает бюджет и население.',
  },
];

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'good' | 'bad';
  effect: {
    population: number;
    money: number;
    technologies: number;
  };
}

export const GOOD_EVENTS: GameEvent[] = [
  {
    id: 'investments',
    title: 'Иностранные инвестиции',
    description: 'Зарубежные инвесторы заинтересовались вашими городами. В экономику вливаются дополнительные средства.',
    type: 'good',
    effect: { population: 5, money: 12, technologies: 0 },
  },
  {
    id: 'green_energy',
    title: 'Программа зелёной энергетики',
    description: 'Государственная поддержка экологических проектов ускорила внедрение новых технологий.',
    type: 'good',
    effect: { population: 3, money: 5, technologies: 4 },
  },
  {
    id: 'demographic_boom',
    title: 'Демографический рост',
    description: 'Благоприятная социальная политика привела к росту рождаемости и притоку мигрантов.',
    type: 'good',
    effect: { population: 15, money: 5, technologies: 0 },
  },
];

export const BAD_EVENTS: GameEvent[] = [
  {
    id: 'crisis',
    title: 'Кризис в стране',
    description: 'Экономический спад затронул все города. Сокращение бюджетов и отток населения.',
    type: 'bad',
    effect: { population: -4, money: -8, technologies: -1 },
  },
  {
    id: 'epidemic',
    title: 'Эпидемия',
    description: 'Вспышка заболевания потребовала карантинных мер и повлияла на демографию.',
    type: 'bad',
    effect: { population: -6, money: -3, technologies: 0 },
  },
  {
    id: 'sanctions',
    title: 'Санкции',
    description: 'Внешнеполитические ограничения ударили по экономике и технологическому сотрудничеству.',
    type: 'bad',
    effect: { population: -2, money: -5, technologies: -1 },
  },
];

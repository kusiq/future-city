import { useCallback, useState } from 'react';
import './App.css';
import { CITY_IMAGES } from './cityImages';
import { CityCard } from './components/CityCard';
import { CreateCityModal } from './components/CreateCityModal';
import { EditCityModal } from './components/EditCityModal';
import { EventModal } from './components/EventModal';
import {
  applyEventToCities,
  applyLevelProgress,
  getDevelopmentRewards,
  getRandomEvent,
  isCityInactive,
} from './gameLogic';
import type { City, DevelopmentOptionId } from './types';
import {
  DEVELOPMENT_OPTIONS,
  INITIAL_LEVEL,
  INITIAL_MONEY,
  INITIAL_POPULATION,
  INITIAL_TECHNOLOGIES,
  LEVEL_THRESHOLDS,
  MAX_CITIES,
  MAX_YEAR,
  MONEY_PER_YEAR,
  START_YEAR,
} from './types';

function createCity(name: string, imageIndex: number): City {
  return {
    id: crypto.randomUUID(),
    name,
    imageIndex: imageIndex % CITY_IMAGES.length,
    population: INITIAL_POPULATION,
    money: INITIAL_MONEY,
    technologies: INITIAL_TECHNOLOGIES,
    level: INITIAL_LEVEL,
  };
}

function getOptionCost(optionId: DevelopmentOptionId): number {
  return DEVELOPMENT_OPTIONS.find((o) => o.id === optionId)?.cost ?? 0;
}

function getMostDevelopedCity(cities: City[]): City | null {
  if (cities.length === 0) return null;
  return [...cities].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    const scoreA = a.population + a.technologies * 2;
    const scoreB = b.population + b.technologies * 2;
    return scoreB - scoreA;
  })[0] ?? null;
}

function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [year, setYear] = useState(START_YEAR);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [developmentChoices, setDevelopmentChoices] = useState<
    Record<string, DevelopmentOptionId>
  >({});
  const [developmentConfirmed, setDevelopmentConfirmed] = useState<Record<string, boolean>>({});
  const [currentEvent, setCurrentEvent] = useState<import('./types').GameEvent | null>(null);
  const [levelUpCityIds, setLevelUpCityIds] = useState<string[]>([]);

  const handleCreateCity = useCallback((name: string) => {
    if (cities.length >= MAX_CITIES) return;
    setCities((prev) => [...prev, createCity(name, prev.length)]);
  }, [cities.length]);

  const handleEditSave = useCallback((updates: Partial<City>) => {
    if (!editCity) return;
    setCities((prev) =>
      prev.map((c) => (c.id === editCity.id ? { ...c, ...updates } : c))
    );
    setEditCity(null);
  }, [editCity]);

  const handleStartSimulation = useCallback(() => {
    setSimulationRunning(true);
  }, []);

  /** Только выбор варианта, деньги не списываются до «Подтвердить» */
  const handleSelectDevelopment = useCallback((cityId: string, optionId: DevelopmentOptionId) => {
    setDevelopmentChoices((prev) => {
      const current = prev[cityId];
      if (current === optionId) {
        const next = { ...prev };
        delete next[cityId];
        return next;
      }
      return { ...prev, [cityId]: optionId };
    });
  }, []);

  const handleConfirmDevelopment = useCallback((cityId: string) => {
    const choice = developmentChoices[cityId];
    if (!choice) return;
    const cost = getOptionCost(choice);
    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId ? { ...c, money: Math.max(0, c.money - cost) } : c
      )
    );
    setDevelopmentConfirmed((prev) => ({ ...prev, [cityId]: true }));
  }, [developmentChoices]);

  const handleCancelDevelopment = useCallback((cityId: string) => {
    const choice = developmentChoices[cityId];
    const wasConfirmed = developmentConfirmed[cityId];
    if (choice && wasConfirmed) {
      const cost = getOptionCost(choice);
      setCities((prev) =>
        prev.map((c) =>
          c.id === cityId ? { ...c, money: c.money + cost } : c
        )
      );
    }
    setDevelopmentChoices((prev) => {
      const next = { ...prev };
      delete next[cityId];
      return next;
    });
    setDevelopmentConfirmed((prev) => {
      const next = { ...prev };
      delete next[cityId];
      return next;
    });
  }, [developmentChoices, developmentConfirmed]);

  const handleEndYear = useCallback(() => {
    setCities((prev) => {
      const next = prev.map((c) => {
        const choice = developmentChoices[c.id];
        const confirmed = developmentConfirmed[c.id];
        // Списание за год + стоимость варианта развития (если не подтверждали досрочно)
        const costThisYear = choice && !confirmed ? getOptionCost(choice) : 0;
        const afterDeduct = {
          ...c,
          money: Math.max(0, c.money - MONEY_PER_YEAR - costThisYear),
        };
        if (!choice) return applyLevelProgress(afterDeduct);
        const rewards = getDevelopmentRewards(choice);
        const updated = {
          ...afterDeduct,
          population: Math.max(0, afterDeduct.population + rewards.population),
          money: Math.max(0, afterDeduct.money + rewards.money),
          technologies: Math.max(0, afterDeduct.technologies + rewards.technologies),
        };
        return applyLevelProgress(updated);
      });
      const leveledUp = next.filter((_, i) => next[i].level > prev[i].level).map((c) => c.id);
      if (leveledUp.length > 0) {
        setTimeout(() => {
          setLevelUpCityIds((ids) => [...ids, ...leveledUp]);
          setTimeout(() => setLevelUpCityIds((ids) => ids.filter((id) => !leveledUp.includes(id))), 2500);
        }, 0);
      }
      return next;
    });
    setYear((y) => y + 1);
    setDevelopmentChoices({});
    setDevelopmentConfirmed({});
    setCurrentEvent(getRandomEvent());
  }, [developmentChoices, developmentConfirmed]);

  const handleCloseEventModal = useCallback(() => {
    if (currentEvent) {
      setCities((prev) => {
        const afterEvent = applyEventToCities(prev, currentEvent);
        const next = afterEvent.map(applyLevelProgress);
        const leveledUp = next.filter((_, i) => next[i].level > prev[i].level).map((c) => c.id);
        if (leveledUp.length > 0) {
          setTimeout(() => {
            setLevelUpCityIds((ids) => [...ids, ...leveledUp]);
            setTimeout(() => setLevelUpCityIds((ids) => ids.filter((id) => !leveledUp.includes(id))), 2500);
          }, 0);
        }
        return next;
      });
      setCurrentEvent(null);
    }
  }, [currentEvent]);

  const handleFinishGame = useCallback(() => {
    setYear(MAX_YEAR + 1);
  }, []);

  const canAddCity = cities.length < MAX_CITIES;
  const isGameOver = year > MAX_YEAR;
  const isYear2035 = year === MAX_YEAR;
  const bestCity = getMostDevelopedCity(cities);

  return (
    <div className="app">
      <div className="app-brand">ЛДПР. Партия молодых</div>
      <header className="app-header">
        <h1 className="game-title">Город будущего</h1>
        <p className="game-description">
          Стратегическая игра для команд от партии ЛДПР: развивайте свой город с 2026 по 2035 год, выбирайте варианты развития и реагируйте на события. Вместе создайте свой процветающий город и получите незабывваемый опыт и награды!
        </p>
        <div className="level-hints">
          <span className="level-hint">
            <strong>Ур. 2:</strong> население ≥ {LEVEL_THRESHOLDS[1].population}к, технологии ≥ {LEVEL_THRESHOLDS[1].technologies}
          </span>
          <span className="level-hint">
            <strong>Ур. 3:</strong> население ≥ {LEVEL_THRESHOLDS[2].population}к, технологии ≥ {LEVEL_THRESHOLDS[2].technologies}
          </span>
        </div>
        {simulationRunning && (
          <p className="year-display">
            {year} год
            {isGameOver && (
              <span className="year-display-end"> — Игра завершена (до {MAX_YEAR})</span>
            )}
          </p>
        )}
      </header>

      <main className="app-main">
        <div className="cities-grid">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isInactive={isCityInactive(city)}
              simulationRunning={simulationRunning}
              selectedDevelopment={developmentChoices[city.id] ?? null}
              effectiveMoney={city.money}
              isChoiceConfirmed={developmentConfirmed[city.id]}
              canConfirm={
                !!developmentChoices[city.id] &&
                city.money >= getOptionCost(developmentChoices[city.id]!)
              }
              showLevelUpEffect={levelUpCityIds.includes(city.id)}
              onEdit={() => setEditCity(city)}
              onSelectDevelopment={(optionId) =>
                handleSelectDevelopment(city.id, optionId)
              }
              onConfirmChoice={() => handleConfirmDevelopment(city.id)}
              onCancelChoice={() => handleCancelDevelopment(city.id)}
            />
          ))}
        </div>

        {canAddCity && (
          <button
            type="button"
            className="btn btn-found"
            onClick={() => setCreateModalOpen(true)}
          >
            Основать город
          </button>
        )}

        {cities.length > 0 && (
          <div className="app-actions-spacer" aria-hidden />
        )}
      </main>

      {cities.length > 0 && (
        <div className="app-actions app-actions--fixed">
          {simulationRunning && isYear2035 ? (
            <button
              type="button"
              className="btn btn-finish"
              onClick={handleFinishGame}
            >
              Завершить игру
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-simulation"
              onClick={simulationRunning ? handleEndYear : handleStartSimulation}
              disabled={simulationRunning && isGameOver}
            >
              {simulationRunning
                ? isGameOver
                  ? `Игра до ${MAX_YEAR} года завершена`
                  : 'Завершить год'
                : 'Запустить симуляцию'}
            </button>
          )}
        </div>
      )}

      <CreateCityModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateCity}
      />

      <EditCityModal
        isOpen={!!editCity}
        city={editCity}
        onClose={() => setEditCity(null)}
        onSave={handleEditSave}
      />

      <EventModal event={currentEvent} onClose={handleCloseEventModal} />

      {isGameOver && cities.length > 0 && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <h2 className="game-over-title">Игра завершена</h2>
            {bestCity && (
              <div className="game-over-best">
                <span className="game-over-best-label">Самый развитый город:</span>
                <strong className="game-over-best-name">{bestCity.name}</strong>
                <span className="game-over-best-stats">
                  Уровень {bestCity.level}, население {bestCity.population}к, технологии {bestCity.technologies}
                </span>
              </div>
            )}
            <p className="game-over-text">
              Все города прошли путь развития до 2035 года. Команды и мэры проявили стратегическое мышление и заботу о своих городах. Теперь всех участников и мэров городов ждут награды от организаторов и ведущих игры — благодарим за участие!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

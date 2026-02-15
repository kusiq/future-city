import type { City } from '../types';
import { getCityImageUrl } from '../cityImages';
import type { DevelopmentOptionId } from '../types';
import { DEVELOPMENT_OPTIONS } from '../types';
import { getDevelopmentRewardsRange } from '../gameLogic';
import './CityCard.css';

function formatRewardRange(min: number, max: number, suffix: string): string {
  const fmt = (n: number) => (n > 0 ? `+${n}` : String(n));
  if (min === max) return min === 0 ? '0' : `${fmt(min)}${suffix}`;
  return `${fmt(min)}–${fmt(max)}${suffix}`;
}

interface CityCardProps {
  city: City;
  isInactive: boolean;
  simulationRunning: boolean;
  selectedDevelopment: DevelopmentOptionId | null;
  /** Деньги с учётом возврата текущего выбора (для доступности кнопок) */
  effectiveMoney: number;
  isChoiceConfirmed?: boolean;
  /** Хватает ли денег на выбранный вариант (для кнопки «Подтвердить») */
  canConfirm?: boolean;
  showLevelUpEffect?: boolean;
  onEdit: () => void;
  onSelectDevelopment: (optionId: DevelopmentOptionId) => void;
  onConfirmChoice?: () => void;
  onCancelChoice?: () => void;
}

export function CityCard({
  city,
  isInactive,
  simulationRunning,
  selectedDevelopment,
  effectiveMoney,
  isChoiceConfirmed = false,
  canConfirm = false,
  showLevelUpEffect = false,
  onEdit,
  onSelectDevelopment,
  onConfirmChoice,
  onCancelChoice,
}: CityCardProps) {
  return (
    <article className={`city-card ${isInactive ? 'city-card--inactive' : ''} ${showLevelUpEffect ? 'city-card--level-up' : ''}`}>
      <div className="city-card-image-wrap">
        <img src={getCityImageUrl(city.imageIndex ?? 0)} alt={city.name} className="city-card-image" />
        <span className="city-card-level">Ур. {city.level}</span>
        {showLevelUpEffect && (
          <span className="city-card-level-up-badge">Уровень повышен!</span>
        )}
      </div>
      <h3 className="city-card-name">{city.name}</h3>
      <ul className="city-card-stats">
        <li>
          <span className="stat-label">Население</span>
          <span className="stat-value">{city.population}к</span>
        </li>
        <li>
          <span className="stat-label">Деньги</span>
          <span className="stat-value">{city.money}</span>
        </li>
        <li>
          <span className="stat-label">Технологии</span>
          <span className="stat-value">{city.technologies}</span>
        </li>
      </ul>

      {simulationRunning && !isInactive && (
        <div className="city-card-development">
          <span className="development-label">Варианты развития (учтутся при завершении года):</span>
          {DEVELOPMENT_OPTIONS.map((opt) => {
            const canAfford = effectiveMoney >= opt.cost;
            const isSelected = selectedDevelopment === opt.id;
            const range = getDevelopmentRewardsRange(opt.id);
            const popStr = formatRewardRange(range.population[0], range.population[1], 'к');
            const moneyStr = (range.money[0] !== 0 || range.money[1] !== 0)
              ? formatRewardRange(range.money[0], range.money[1], '')
              : null;
            const techStr = (range.technologies[0] !== 0 || range.technologies[1] !== 0)
              ? formatRewardRange(range.technologies[0], range.technologies[1], '')
              : null;
            const rewardParts = [
              `насел. ${popStr}`,
              moneyStr !== null && `деньги ${moneyStr}`,
              techStr !== null && `техн. ${techStr}`,
            ].filter(Boolean);
            const rewardPreview = rewardParts.length ? ` → ${rewardParts.join(', ')}` : '';
            const locked = isChoiceConfirmed && selectedDevelopment !== opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`btn-development ${isSelected ? 'btn-development--selected' : ''} ${locked ? 'btn-development--locked' : ''}`}
                disabled={locked || !canAfford}
                onClick={() => !locked && onSelectDevelopment(opt.id)}
                title={opt.description + rewardPreview}
              >
                <span className="development-name">{opt.name}</span>
                <span className="development-cost">Тратит {opt.cost} денег</span>
                <span className="development-reward">{rewardPreview || ' — без прироста'}</span>
              </button>
            );
          })}
          {selectedDevelopment && (
            <div className="development-actions">
              <button
                type="button"
                className="btn-development-cancel"
                onClick={onCancelChoice}
              >
                Отменить
              </button>
              {!isChoiceConfirmed && (
                <button
                  type="button"
                  className="btn-development-confirm"
                  onClick={onConfirmChoice}
                  disabled={!canConfirm}
                  title="Опционально: списать деньги сейчас. Иначе списание при завершении года."
                >
                  Подтвердить досрочно
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="city-card-edit btn-edit"
        onClick={onEdit}
      >
        Изменить ресурсы
      </button>
    </article>
  );
}

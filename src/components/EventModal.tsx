import type { GameEvent } from '../types';
import './Modal.css';

interface EventModalProps {
  event: GameEvent | null;
  onClose: () => void;
}

function formatEffect(value: number, suffix: string): string {
  if (value === 0) return '—';
  const v = value > 0 ? `+${value}` : String(value);
  return `${v}${suffix}`;
}

export function EventModal({ event, onClose }: EventModalProps) {
  if (!event) return null;
  const { effect } = event;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal-event modal-event--${event.type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal-title">{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <div className="event-effects">
          <span className="event-effect-item">
            Население: {formatEffect(effect.population, 'к')}
          </span>
          <span className="event-effect-item">
            Деньги: {formatEffect(effect.money, '')}
          </span>
          <span className="event-effect-item">
            Технологии: {formatEffect(effect.technologies, '')}
          </span>
        </div>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Продолжить
        </button>
      </div>
    </div>
  );
}

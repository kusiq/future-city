import { useState, useEffect } from 'react';
import type { City } from '../types';
import { playClickSound } from '../sounds';
import './Modal.css';

interface EditCityModalProps {
  isOpen: boolean;
  city: City | null;
  onClose: () => void;
  onSave: (updates: Partial<City>) => void;
}

export function EditCityModal({ isOpen, city, onClose, onSave }: EditCityModalProps) {
  const [population, setPopulation] = useState(0);
  const [money, setMoney] = useState(0);
  const [technologies, setTechnologies] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (city) {
      setPopulation(city.population);
      setMoney(city.money);
      setTechnologies(city.technologies);
      setLevel(city.level);
    }
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    onSave({
      population: Math.max(0, population),
      money: Math.max(0, money),
      technologies: Math.max(0, technologies),
      level: Math.max(1, level),
    });
    onClose();
  };

  if (!isOpen || !city) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-edit" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Редактировать: {city.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="modal-fields">
            <div className="field">
              <label>Население (тыс.)</label>
              <input
                type="number"
                min={0}
                value={population}
                onChange={(e) => setPopulation(Number(e.target.value) || 0)}
              />
            </div>
            <div className="field">
              <label>Деньги</label>
              <input
                type="number"
                min={0}
                value={money}
                onChange={(e) => setMoney(Number(e.target.value) || 0)}
              />
            </div>
            <div className="field">
              <label>Технологии</label>
              <input
                type="number"
                min={0}
                value={technologies}
                onChange={(e) => setTechnologies(Number(e.target.value) || 0)}
              />
            </div>
            <div className="field">
              <label>Уровень города</label>
              <input
                type="number"
                min={1}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { playClickSound(); onClose(); }}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

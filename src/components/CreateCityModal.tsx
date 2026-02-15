import { useState, useRef, useEffect } from 'react';
import './Modal.css';

interface CreateCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateCityModal({ isOpen, onClose, onCreate }: CreateCityModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-create" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Основать город</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="modal-input"
            placeholder="Название города"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              ОК
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

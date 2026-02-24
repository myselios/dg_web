import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { COMFY_MODELS } from '../../../infrastructure/mock/data';
import styles from './SearchOverlay.module.css';

interface Props {
  readonly onClose: () => void;
  readonly onSelectCard: (cardId: string) => void;
}

export function SearchOverlay({ onClose, onSelectCard }: Props) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.gallery.filter(
      (c) =>
        c.prompt.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query, state.gallery]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search prompts, authors, models..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.results}>
          {query.trim() && results.length === 0 && (
            <div className={styles.noResults}>No results for "{query}"</div>
          )}
          {results.map((card) => {
            const model = COMFY_MODELS.find((m) => m.id === card.model);
            return (
              <button
                key={card.id}
                className={styles.resultItem}
                onClick={() => { onSelectCard(card.id); onClose(); }}
              >
                <img className={styles.resultThumb} src={card.imageUrl} alt="" />
                <div className={styles.resultText}>
                  <div className={styles.resultPrompt}>{card.prompt}</div>
                  <div className={styles.resultMeta}>
                    {card.author} &middot; {model?.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

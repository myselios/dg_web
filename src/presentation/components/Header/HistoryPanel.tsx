import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { COMFY_MODELS } from '../../../infrastructure/mock/data';
import styles from './HistoryPanel.module.css';

interface Props {
  readonly onClose: () => void;
  readonly onSelectCard: (cardId: string) => void;
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function HistoryPanel({ onClose, onSelectCard }: Props) {
  const { state } = useApp();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Show user-generated items first, then all items as "history"
  const userItems = state.gallery.filter((c) => c.author === 'you');
  const recentItems = userItems.length > 0 ? userItems : state.gallery.slice(0, 10);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>History</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close history">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.list}>
          {recentItems.length === 0 ? (
            <div className={styles.empty}>No generation history yet.</div>
          ) : (
            recentItems.map((card) => {
              const model = COMFY_MODELS.find((m) => m.id === card.model);
              return (
                <div
                  key={card.id}
                  className={styles.item}
                  onClick={() => { onSelectCard(card.id); onClose(); }}
                >
                  <img className={styles.thumb} src={card.imageUrl} alt="" />
                  <div className={styles.info}>
                    <span className={styles.prompt}>{card.prompt}</span>
                    <span className={styles.meta}>
                      {model?.name} &middot; {formatTime(card.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

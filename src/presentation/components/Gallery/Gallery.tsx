import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { COMFY_MODELS, WORKFLOW_LABELS } from '../../../infrastructure/mock/data';
import type { GalleryCard } from '../../../domain/entities/types';
import styles from './Gallery.module.css';

const HeartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getModelName(modelId: string): string {
  return COMFY_MODELS.find((m) => m.id === modelId)?.name ?? modelId;
}

function GalleryCardItem({ card, onClick }: { card: GalleryCard; onClick: () => void }) {
  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.imageWrap}>
        <img
          className={styles.image}
          src={card.imageUrl}
          alt={card.prompt.slice(0, 60)}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <p className={styles.overlayPrompt}>{card.prompt}</p>
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={styles.author}>{card.author}</span>
          <span className={styles.details}>
            {getModelName(card.model)} &middot; {formatTime(card.createdAt)}
          </span>
        </div>
        <span className={styles.likes}>
          <HeartIcon /> {card.likes}
        </span>
      </div>
    </article>
  );
}

interface GalleryProps {
  readonly onCardClick: (card: GalleryCard) => void;
}

export function Gallery({ onCardClick }: GalleryProps) {
  const { state } = useApp();

  const filtered = useMemo(
    () => state.gallery.filter((c) => c.workflow === state.selectedWorkflow),
    [state.gallery, state.selectedWorkflow],
  );

  return (
    <section className={styles.section}>
      <div className={styles.divider} />
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyContent}>
            <span className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </span>
            <p>No images in <strong>{WORKFLOW_LABELS[state.selectedWorkflow]}</strong> yet.</p>
            <p className={styles.emptyHint}>Be the first to create one!</p>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((card) => (
            <GalleryCardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </div>
      )}
    </section>
  );
}

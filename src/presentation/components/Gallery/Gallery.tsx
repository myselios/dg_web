/**
 * Gallery Component (T-009, Story S3)
 *
 * Displays a masonry-like grid of gallery cards filtered by the
 * currently selected workflow from context.
 */
import { useApp } from '../../context/AppContext';
import type { GalleryCard } from '../../../domain/entities/types';
import styles from './Gallery.module.css';

interface GalleryProps {
  readonly onCardClick: (cardId: string) => void;
}

export default function Gallery({ onCardClick }: GalleryProps) {
  const { state } = useApp();

  const filteredCards: readonly GalleryCard[] = state.gallery.filter(
    (card) => card.workflow === state.selectedWorkflow
  );

  if (filteredCards.length === 0) {
    return (
      <div className={styles.empty} data-testid="gallery-empty">
        <p className={styles.emptyText}>No images found for this workflow.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {filteredCards.map((card) => (
        <article
          key={card.id}
          className={styles.card}
          tabIndex={0}
          onClick={() => onCardClick(card.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onCardClick(card.id);
            }
          }}
        >
          <img
            className={styles.image}
            src={card.imageUrl}
            alt={card.prompt}
          />
          <div className={styles.info}>
            <p className={styles.prompt} data-testid="card-prompt">
              {card.prompt}
            </p>
            <span className={styles.author} data-testid="card-author">
              {card.author}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

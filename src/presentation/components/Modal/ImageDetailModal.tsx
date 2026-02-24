import { useEffect, useCallback, useState } from 'react';
import type { GalleryCard } from '../../../domain/entities/types';
import { COMFY_MODELS, WORKFLOW_LABELS } from '../../../infrastructure/mock/data';
import styles from './ImageDetailModal.module.css';

interface Props {
  readonly card: GalleryCard | null;
  readonly onClose: () => void;
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ImageDetailModal({ card, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  const handleCopy = useCallback(() => {
    if (!card) return;
    navigator.clipboard.writeText(card.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [card]);

  if (!card) return null;

  const model = COMFY_MODELS.find((m) => m.id === card.model);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className={styles.imageSection}>
          <img className={styles.image} src={card.imageUrl} alt={card.prompt.slice(0, 60)} />
        </div>

        <div className={styles.details}>
          <div className={styles.authorRow}>
            <div className={styles.authorAvatar}>
              {card.author.charAt(0).toUpperCase()}
            </div>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{card.author}</span>
              <span className={styles.authorTime}>{formatTime(card.createdAt)}</span>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Prompt</span>
            <p className={styles.prompt}>{card.prompt}</p>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Details</span>
            <div className={styles.tagRow}>
              <span className={styles.tag}>{model?.name ?? card.model}</span>
              <span className={styles.tag}>{WORKFLOW_LABELS[card.workflow]}</span>
              <span className={styles.tag}>{card.likes} likes</span>
            </div>
          </div>

          <button className={styles.copyBtn} onClick={handleCopy}>
            <CopyIcon />
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
}

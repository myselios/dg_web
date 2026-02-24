import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { STYLE_GUIDE_TIPS } from '../../../infrastructure/mock/data';
import styles from './StyleGuideModal.module.css';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export function StyleGuideModal() {
  const { state, dispatch } = useApp();
  const [index, setIndex] = useState(0);

  const close = useCallback(
    () => dispatch({ type: 'TOGGLE_STYLE_GUIDE' }),
    [dispatch],
  );

  const prev = useCallback(
    () => setIndex((i) => (i > 0 ? i - 1 : STYLE_GUIDE_TIPS.length - 1)),
    [],
  );

  const next = useCallback(
    () => setIndex((i) => (i < STYLE_GUIDE_TIPS.length - 1 ? i + 1 : 0)),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, prev, next]);

  if (!state.isStyleGuideOpen) return null;

  const tip = STYLE_GUIDE_TIPS[index];

  return (
    <div className={styles.backdrop} onClick={close}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Prompt Style Guide</h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.slideArea}>
          <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={prev} aria-label="Previous tip">
            <ArrowLeft />
          </button>

          <div className={styles.slide}>
            <span className={styles.slideNumber}>Tip {index + 1} / {STYLE_GUIDE_TIPS.length}</span>
            <h3 className={styles.slideTitle}>{tip.title}</h3>
            <p className={styles.slideDesc}>{tip.description}</p>
          </div>

          <button className={`${styles.navBtn} ${styles.navNext}`} onClick={next} aria-label="Next tip">
            <ArrowRight />
          </button>
        </div>

        <div className={styles.indicators}>
          {STYLE_GUIDE_TIPS.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to tip ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

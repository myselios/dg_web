/**
 * StyleGuideModal Component (T-011, Story S6)
 *
 * A 10-slide tip carousel with navigation buttons, indicator dots,
 * keyboard navigation (ArrowRight/ArrowLeft), and ESC to close.
 */
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { STYLE_GUIDE_TIPS } from '../../../infrastructure/mock/data';
import styles from './StyleGuideModal.module.css';

const TOTAL_SLIDES = STYLE_GUIDE_TIPS.length;

export default function StyleGuideModal() {
  const { state, dispatch } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (state.isStyleGuideOpen) {
      setCurrentSlide(0);
    }
  }, [state.isStyleGuideOpen]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleClose = useCallback(() => {
    dispatch({ type: 'CLOSE_STYLE_GUIDE' });
  }, [dispatch]);

  useEffect(() => {
    if (state.isStyleGuideOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [state.isStyleGuideOpen]);

  useEffect(() => {
    if (!state.isStyleGuideOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isStyleGuideOpen, goNext, goPrev, handleClose]);

  if (!state.isStyleGuideOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.slideContent} data-testid="slide-content">
          {STYLE_GUIDE_TIPS[currentSlide]}
        </div>

        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            type="button"
            aria-label="Previous tip"
            onClick={goPrev}
            disabled={currentSlide === 0}
          >
            Previous
          </button>

          <div className={styles.dots}>
            {Array.from({ length: TOTAL_SLIDES }, (_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
                data-testid={`dot-${index}`}
                aria-current={index === currentSlide ? 'true' : 'false'}
              />
            ))}
          </div>

          <button
            className={styles.navButton}
            type="button"
            aria-label="Next tip"
            onClick={goNext}
            disabled={currentSlide === TOTAL_SLIDES - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

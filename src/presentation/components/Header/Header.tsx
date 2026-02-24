import { useApp } from '../../context/AppContext';
import styles from './Header.module.css';

/* ── SVG Icons (inline, no dependency) ── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </svg>
);

export function Header() {
  const { state, dispatch } = useApp();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.logo}>
          Future<span className={styles.logoAccent}>Lens</span> Visual
        </span>
      </div>

      <div className={styles.right}>
        <div className={styles.queueBadge}>
          <span className={styles.queueDot} />
          Queue {state.queue.pending + state.queue.processing}
        </div>

        <div className={styles.divider} />

        <button
          className={styles.styleGuideBtn}
          onClick={() => dispatch({ type: 'TOGGLE_STYLE_GUIDE' })}
          aria-label="Open style guide"
        >
          <SparkleIcon />
          Style Guide
        </button>

        <button className={styles.iconBtn} aria-label="Search">
          <SearchIcon />
        </button>

        <button className={styles.iconBtn} aria-label="History">
          <HistoryIcon />
        </button>

        <div className={styles.avatar} aria-label="User profile">
          U
        </div>
      </div>
    </header>
  );
}

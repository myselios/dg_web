/**
 * Header Component (T-007, Story S1)
 *
 * Displays app title, queue status badge, profile avatar,
 * and action buttons (style guide, search, history).
 * Samsung One UI dark theme styling.
 */
import { useApp } from '../../context/AppContext';
import styles from './Header.module.css';

interface HeaderProps {
  readonly onSearchClick: () => void;
  readonly onHistoryClick: () => void;
}

export default function Header({ onSearchClick, onHistoryClick }: HeaderProps) {
  const { state, dispatch } = useApp();

  const handleStyleGuideClick = () => {
    dispatch({ type: 'TOGGLE_STYLE_GUIDE' });
  };

  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>FutureLens Visual</h1>
      </div>

      <div className={styles.actions}>
        <span className={styles.queueBadge} data-testid="queue-status">
          {state.queue.pending}
        </span>

        <button
          className={styles.iconButton}
          aria-label="Open style guide"
          onClick={handleStyleGuideClick}
          type="button"
        >
          &#x1F4D6;
        </button>

        <button
          className={styles.iconButton}
          aria-label="Search"
          onClick={onSearchClick}
          type="button"
        >
          &#x1F50D;
        </button>

        <button
          className={styles.iconButton}
          aria-label="History"
          onClick={onHistoryClick}
          type="button"
        >
          &#x1F552;
        </button>

        <div className={styles.profileAvatar} data-testid="profile-avatar">
          U
        </div>
      </div>
    </header>
  );
}

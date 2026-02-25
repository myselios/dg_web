/**
 * App Component (T-013)
 *
 * Main application component that integrates all sub-components
 * within the AppProvider context. Layout: fixed Header at top,
 * FeatureSelect below header, scrollable Gallery, fixed CreationZone
 * at bottom, and StyleGuideModal overlay.
 */
import './presentation/styles/global.css';
import { AppProvider } from './presentation/context/AppContext';
import Header from './presentation/components/Header/Header';
import FeatureSelect from './presentation/components/FeatureSelect/FeatureSelect';
import Gallery from './presentation/components/Gallery/Gallery';
import CreationZone from './presentation/components/CreationZone/CreationZone';
import StyleGuideModal from './presentation/components/Modal/StyleGuideModal';
import styles from './App.module.css';

const handleSearchClick = () => {
  // Search functionality placeholder
};

const handleHistoryClick = () => {
  // History functionality placeholder
};

const handleCardClick = (_cardId: string) => {
  // Card click functionality placeholder
};

export default function App() {
  return (
    <AppProvider>
      <div className={styles.app}>
        <Header
          onSearchClick={handleSearchClick}
          onHistoryClick={handleHistoryClick}
        />
        <div className={styles.content}>
          <FeatureSelect />
          <main className={styles.gallery}>
            <Gallery onCardClick={handleCardClick} />
          </main>
        </div>
        <CreationZone />
        <StyleGuideModal />
      </div>
    </AppProvider>
  );
}

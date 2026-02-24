import { AppProvider } from './presentation/context/AppContext';
import { Header } from './presentation/components/Header/Header';
import { FeatureSelect } from './presentation/components/FeatureSelect/FeatureSelect';
import { Gallery } from './presentation/components/Gallery/Gallery';
import { CreationZone } from './presentation/components/CreationZone/CreationZone';
import { StyleGuideModal } from './presentation/components/Modal/StyleGuideModal';
import styles from './App.module.css';

function AppContent() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <FeatureSelect />
        <Gallery />
      </main>
      <CreationZone />
      <StyleGuideModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

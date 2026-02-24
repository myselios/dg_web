import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './presentation/context/AppContext';
import { ToastProvider } from './presentation/components/common/Toast';
import { Header } from './presentation/components/Header/Header';
import { FeatureSelect } from './presentation/components/FeatureSelect/FeatureSelect';
import { Gallery } from './presentation/components/Gallery/Gallery';
import { CreationZone } from './presentation/components/CreationZone/CreationZone';
import { StyleGuideModal } from './presentation/components/Modal/StyleGuideModal';
import { ImageDetailModal } from './presentation/components/Modal/ImageDetailModal';
import { SearchOverlay } from './presentation/components/Header/SearchOverlay';
import { HistoryPanel } from './presentation/components/Header/HistoryPanel';
import type { GalleryCard } from './domain/entities/types';
import styles from './App.module.css';

function AppContent() {
  const { state } = useApp();
  const [selectedCard, setSelectedCard] = useState<GalleryCard | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleSelectCard = useCallback(
    (cardId: string) => {
      const card = state.gallery.find((c) => c.id === cardId) ?? null;
      setSelectedCard(card);
    },
    [state.gallery],
  );

  return (
    <div className={styles.layout}>
      <Header
        onSearchClick={() => setIsSearchOpen(true)}
        onHistoryClick={() => setIsHistoryOpen(true)}
      />
      <main className={styles.main}>
        <FeatureSelect />
        <Gallery onCardClick={setSelectedCard} />
      </main>
      <CreationZone />

      <StyleGuideModal />
      <ImageDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />

      {isSearchOpen && (
        <SearchOverlay
          onClose={() => setIsSearchOpen(false)}
          onSelectCard={handleSelectCard}
        />
      )}

      {isHistoryOpen && (
        <HistoryPanel
          onClose={() => setIsHistoryOpen(false)}
          onSelectCard={handleSelectCard}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}

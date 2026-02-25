/**
 * AppContext (T-006)
 *
 * Global application context using React Context + useReducer.
 * Manages workflow selection, model, gallery, queue, and generation state.
 */
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  GalleryCard,
  WorkflowType,
  QueueStatus,
  GenerationStatus,
} from '../../domain/entities/types';
import { GALLERY_CARDS } from '../../infrastructure/mock/data';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface AppState {
  readonly selectedWorkflow: WorkflowType;
  readonly selectedModel: string;
  readonly gallery: readonly GalleryCard[];
  readonly queue: QueueStatus;
  readonly generationStatus: GenerationStatus;
  readonly generationProgress: number;
  readonly isStyleGuideOpen: boolean;
  readonly prompt: string;
  readonly uploadedImage: string | null;
}

const INITIAL_STATE: AppState = {
  selectedWorkflow: 't2i',
  selectedModel: 'sdxl-1.0',
  gallery: GALLERY_CARDS,
  queue: { pending: 0, processing: 0 },
  generationStatus: 'idle',
  generationProgress: 0,
  isStyleGuideOpen: false,
  prompt: '',
  uploadedImage: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type AppAction =
  | { readonly type: 'SET_WORKFLOW'; readonly payload: WorkflowType }
  | { readonly type: 'SET_MODEL'; readonly payload: string }
  | { readonly type: 'ADD_TO_GALLERY'; readonly payload: GalleryCard }
  | { readonly type: 'SET_QUEUE'; readonly payload: QueueStatus }
  | { readonly type: 'SET_GENERATION_STATUS'; readonly payload: GenerationStatus }
  | { readonly type: 'SET_GENERATION_PROGRESS'; readonly payload: number }
  | { readonly type: 'TOGGLE_STYLE_GUIDE' }
  | { readonly type: 'OPEN_STYLE_GUIDE' }
  | { readonly type: 'CLOSE_STYLE_GUIDE' }
  | { readonly type: 'SET_PROMPT'; readonly payload: string }
  | { readonly type: 'SET_UPLOADED_IMAGE'; readonly payload: string | null };

// ---------------------------------------------------------------------------
// Reducer (immutable — every case returns a new object via spread)
// ---------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WORKFLOW':
      return { ...state, selectedWorkflow: action.payload };

    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };

    case 'ADD_TO_GALLERY':
      return { ...state, gallery: [action.payload, ...state.gallery] };

    case 'SET_QUEUE':
      return { ...state, queue: action.payload };

    case 'SET_GENERATION_STATUS':
      return { ...state, generationStatus: action.payload };

    case 'SET_GENERATION_PROGRESS':
      return { ...state, generationProgress: action.payload };

    case 'TOGGLE_STYLE_GUIDE':
      return { ...state, isStyleGuideOpen: !state.isStyleGuideOpen };

    case 'OPEN_STYLE_GUIDE':
      return { ...state, isStyleGuideOpen: true };

    case 'CLOSE_STYLE_GUIDE':
      return { ...state, isStyleGuideOpen: false };

    case 'SET_PROMPT':
      return { ...state, prompt: action.payload };

    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImage: action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
  readonly state: AppState;
  readonly dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AppProviderProps {
  readonly children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

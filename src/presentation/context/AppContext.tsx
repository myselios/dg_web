import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  WorkflowType,
  GenerationStatus,
  ModelId,
  GalleryCard,
  QueueStatus,
} from '../../domain/entities/types';
import { MOCK_GALLERY } from '../../infrastructure/mock/data';

/* ── State ── */
interface AppState {
  readonly selectedWorkflow: WorkflowType;
  readonly selectedModel: ModelId;
  readonly gallery: readonly GalleryCard[];
  readonly queue: QueueStatus;
  readonly generationStatus: GenerationStatus;
  readonly generationProgress: number;
  readonly isStyleGuideOpen: boolean;
  readonly prompt: string;
  readonly uploadedImage: string | null;
}

const initialState: AppState = {
  selectedWorkflow: 'text-to-image',
  selectedModel: 'sdxl',
  gallery: MOCK_GALLERY,
  queue: { pending: 3, processing: 1 },
  generationStatus: 'idle',
  generationProgress: 0,
  isStyleGuideOpen: false,
  prompt: '',
  uploadedImage: null,
};

/* ── Actions ── */
type AppAction =
  | { type: 'SET_WORKFLOW'; payload: WorkflowType }
  | { type: 'SET_MODEL'; payload: ModelId }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_UPLOADED_IMAGE'; payload: string | null }
  | { type: 'START_GENERATION' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'COMPLETE_GENERATION'; payload: GalleryCard }
  | { type: 'FAIL_GENERATION' }
  | { type: 'TOGGLE_STYLE_GUIDE' };

/* ── Reducer (immutable) ── */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WORKFLOW':
      return { ...state, selectedWorkflow: action.payload };

    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };

    case 'SET_PROMPT':
      return { ...state, prompt: action.payload };

    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImage: action.payload };

    case 'START_GENERATION':
      return {
        ...state,
        generationStatus: 'generating',
        generationProgress: 0,
        queue: {
          ...state.queue,
          pending: state.queue.pending + 1,
        },
      };

    case 'UPDATE_PROGRESS':
      return { ...state, generationProgress: action.payload };

    case 'COMPLETE_GENERATION':
      return {
        ...state,
        generationStatus: 'completed',
        generationProgress: 100,
        gallery: [action.payload, ...state.gallery],
        queue: {
          ...state.queue,
          pending: Math.max(0, state.queue.pending - 1),
        },
        prompt: '',
        uploadedImage: null,
      };

    case 'FAIL_GENERATION':
      return {
        ...state,
        generationStatus: 'failed',
        generationProgress: 0,
        queue: {
          ...state.queue,
          pending: Math.max(0, state.queue.pending - 1),
        },
      };

    case 'TOGGLE_STYLE_GUIDE':
      return { ...state, isStyleGuideOpen: !state.isStyleGuideOpen };

    default:
      return state;
  }
}

/* ── Context ── */
interface AppContextValue {
  readonly state: AppState;
  readonly dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

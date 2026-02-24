import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { COMFY_MODELS } from '../../../infrastructure/mock/data';
import { simulateGeneration } from '../../../infrastructure/mock/generation-service';
import type { ModelId } from '../../../domain/entities/types';
import styles from './CreationZone.module.css';

/* ── Icons ── */
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export function CreationZone() {
  const { state, dispatch } = useApp();
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isModelOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isModelOpen]);

  const isGenerating = state.generationStatus === 'generating';
  const selectedModel = COMFY_MODELS.find((m) => m.id === state.selectedModel);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      dispatch({ type: 'SET_UPLOADED_IMAGE', payload: url });
      e.target.value = '';
    },
    [dispatch],
  );

  const handleGenerate = useCallback(async () => {
    if (!state.prompt.trim() || isGenerating) return;
    setError(null);
    dispatch({ type: 'START_GENERATION' });

    try {
      const result = await simulateGeneration(
        {
          prompt: state.prompt,
          model: state.selectedModel,
          workflow: state.selectedWorkflow,
          referenceImageUrl: state.uploadedImage ?? undefined,
        },
        (progress) => dispatch({ type: 'UPDATE_PROGRESS', payload: progress }),
      );

      dispatch({
        type: 'COMPLETE_GENERATION',
        payload: {
          ...result,
          author: 'you',
          likes: 0,
        },
      });
    } catch (err) {
      dispatch({ type: 'FAIL_GENERATION' });
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  }, [state.prompt, state.selectedModel, state.selectedWorkflow, state.uploadedImage, isGenerating, dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate],
  );

  const handleModelSelect = useCallback(
    (id: ModelId) => {
      dispatch({ type: 'SET_MODEL', payload: id });
      setIsModelOpen(false);
    },
    [dispatch],
  );

  const statusClass = (s: string) => {
    if (s === 'online') return styles.statusOnline;
    if (s === 'loading') return styles.statusLoading;
    return styles.statusOffline;
  };

  return (
    <div className={styles.wrapper}>
      {/* Thumbnail preview */}
      {state.uploadedImage && (
        <div className={styles.thumbnailRow}>
          <div className={styles.thumbnailWrap}>
            <img className={styles.thumbnailImg} src={state.uploadedImage} alt="Upload preview" />
            <button
              className={styles.thumbnailRemove}
              onClick={() => dispatch({ type: 'SET_UPLOADED_IMAGE', payload: null })}
              aria-label="Remove uploaded image"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Prompt bar */}
      <div className={styles.promptBar}>
        <button
          className={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={isGenerating}
          aria-label="Upload image"
        >
          <PlusIcon />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleUpload}
        />

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Describe the image you want to create..."
          value={state.prompt}
          onChange={(e) => dispatch({ type: 'SET_PROMPT', payload: e.target.value })}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          rows={1}
        />

        {/* Model selector */}
        <div className={styles.modelSelect} ref={dropdownRef}>
          <button
            className={styles.modelBtn}
            onClick={() => setIsModelOpen((p) => !p)}
            disabled={isGenerating}
          >
            {selectedModel?.name ?? 'Model'} <ChevronIcon />
          </button>

          {isModelOpen && (
            <div className={styles.modelDropdown}>
              {COMFY_MODELS.map((m) => (
                <button
                  key={m.id}
                  className={`${styles.modelOption} ${state.selectedModel === m.id ? styles.modelOptionActive : ''}`}
                  onClick={() => handleModelSelect(m.id)}
                >
                  <span className={styles.modelName}>
                    <span className={`${styles.modelStatus} ${statusClass(m.status)}`} />
                    {m.name}
                  </span>
                  <span className={styles.modelDesc}>{m.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={isGenerating || !state.prompt.trim()}
          aria-label="Generate image"
        >
          <SendIcon />
        </button>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        <button className={styles.internalBtn}>
          <span
            className={styles.internalDot}
            style={{ background: selectedModel?.status === 'online' ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          Internal &middot; {selectedModel?.status ?? 'unknown'}
        </button>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${state.generationProgress}%` }}
            />
          </div>
          <div className={styles.progressLabel}>
            Generating... {state.generationProgress}%
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className={styles.errorMsg}>{error}</div>}
    </div>
  );
}

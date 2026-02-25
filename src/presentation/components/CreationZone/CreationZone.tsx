/**
 * CreationZone Component (T-010 + T-012, Story S4)
 *
 * Provides prompt input textarea, file upload button, model selection dropdown,
 * and generate button. Fixed at the bottom of the viewport with dark theme styling.
 * Integrates with the mock generation service to simulate image generation
 * with progress tracking.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COMFY_MODELS } from '../../../infrastructure/mock/data';
import { simulateGeneration } from '../../../infrastructure/mock/generation-service';
import type { ComfyModel, GalleryCard } from '../../../domain/entities/types';
import styles from './CreationZone.module.css';

function createGalleryCard(
  imageUrl: string,
  prompt: string,
  model: string,
  workflow: GalleryCard['workflow'],
): GalleryCard {
  return {
    id: `gen-${Date.now()}`,
    imageUrl,
    prompt,
    author: 'You',
    model,
    workflow,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
}

export default function CreationZone() {
  const { state, dispatch } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGenerating = state.generationStatus === 'generating';

  const selectedModel = COMFY_MODELS.find(
    (m) => m.id === state.selectedModel,
  );

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_PROMPT', payload: e.target.value });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    dispatch({ type: 'SET_UPLOADED_IMAGE', payload: objectUrl });
  };

  const handleModelSelect = (model: ComfyModel) => {
    dispatch({ type: 'SET_MODEL', payload: model.id });
    setIsDropdownOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isDropdownOpen]);

  const handleGenerate = useCallback(async () => {
    if (state.prompt.trim().length === 0 || isGenerating) {
      return;
    }

    dispatch({ type: 'SET_GENERATION_STATUS', payload: 'generating' });
    dispatch({ type: 'SET_GENERATION_PROGRESS', payload: 0 });

    try {
      const result = await simulateGeneration(
        {
          prompt: state.prompt,
          model: state.selectedModel,
          workflow: state.selectedWorkflow,
        },
        (pct) => {
          dispatch({ type: 'SET_GENERATION_PROGRESS', payload: pct });
        },
      );

      if (result.status === 'success') {
        const card = createGalleryCard(
          result.imageUrl,
          state.prompt,
          state.selectedModel,
          state.selectedWorkflow,
        );
        dispatch({ type: 'ADD_TO_GALLERY', payload: card });
        dispatch({ type: 'SET_GENERATION_STATUS', payload: 'completed' });
      } else {
        dispatch({ type: 'SET_GENERATION_STATUS', payload: 'error' });
      }
    } catch {
      dispatch({ type: 'SET_GENERATION_STATUS', payload: 'error' });
    }

    dispatch({ type: 'SET_GENERATION_PROGRESS', payload: 0 });
  }, [state.prompt, state.selectedModel, state.selectedWorkflow, isGenerating, dispatch]);

  const isPromptEmpty = state.prompt.trim().length === 0;
  const isDisabled = isPromptEmpty || isGenerating;

  return (
    <div className={styles.creationZone}>
      {isGenerating && (
        <div className={styles.progressBar} data-testid="progress-bar">
          <div
            className={styles.progressFill}
            style={{ width: `${state.generationProgress}%` }}
          />
        </div>
      )}

      <div className={styles.inputRow}>
        <button
          className={styles.uploadButton}
          type="button"
          aria-label="Upload"
          onClick={handleUploadClick}
        >
          +
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          data-testid="file-input"
        />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
          {state.uploadedImage && (
            <img
              src={state.uploadedImage}
              alt="Upload preview"
              data-testid="upload-preview"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          )}
          <textarea
            className={styles.promptInput}
            placeholder="Describe the image you want to create..."
            value={state.prompt}
            onChange={handlePromptChange}
            rows={1}
            disabled={isGenerating}
          />
        </div>

        <div className={styles.modelSelector} ref={dropdownRef}>
          <button
            className={styles.modelSelectButton}
            data-testid="model-select-button"
            type="button"
            onClick={handleToggleDropdown}
          >
            {selectedModel?.name ?? 'Select Model'}
          </button>

          {isDropdownOpen && (
            <div
              className={styles.modelDropdown}
              data-testid="model-dropdown"
              role="listbox"
            >
              {COMFY_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={styles.modelOption}
                  data-testid="model-option"
                  role="option"
                  aria-selected={model.id === state.selectedModel}
                  onClick={() => handleModelSelect(model)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleModelSelect(model);
                    }
                  }}
                  tabIndex={0}
                >
                  <span className={styles.modelName}>{model.name}</span>
                  <span className={styles.modelDescription}>
                    {model.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className={styles.generateButton}
          type="button"
          aria-label="Generate image"
          disabled={isDisabled}
          onClick={handleGenerate}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
}

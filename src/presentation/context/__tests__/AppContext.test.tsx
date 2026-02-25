/**
 * TDD RED Phase - AppContext (T-006)
 *
 * Tests for the global application context using React Context + useReducer.
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '../AppContext';
import type { GalleryCard, WorkflowType } from '../../../domain/entities/types';

/**
 * Helper component to expose context values for testing.
 */
function TestConsumer() {
  const { state, dispatch } = useApp();
  return (
    <div>
      <span data-testid="workflow">{state.selectedWorkflow}</span>
      <span data-testid="model">{state.selectedModel ?? 'none'}</span>
      <span data-testid="gallery-count">{state.gallery.length}</span>
      <button
        data-testid="set-workflow"
        onClick={() =>
          dispatch({ type: 'SET_WORKFLOW', payload: 'upscale' as WorkflowType })
        }
      >
        Set Workflow
      </button>
      <button
        data-testid="set-model"
        onClick={() => dispatch({ type: 'SET_MODEL', payload: 'flux' })}
      >
        Set Model
      </button>
      <button
        data-testid="add-gallery"
        onClick={() =>
          dispatch({
            type: 'ADD_TO_GALLERY',
            payload: {
              id: 'new-card-1',
              imageUrl: 'https://example.com/new.png',
              prompt: 'Test generated image',
              author: 'testuser',
              model: 'sdxl',
              workflow: 't2i',
              likes: 0,
              createdAt: new Date().toISOString(),
            } satisfies GalleryCard,
          })
        }
      >
        Add to Gallery
      </button>
    </div>
  );
}

describe('AppContext (T-006)', () => {
  describe('AppProvider', () => {
    it('should render children', () => {
      // Arrange & Act
      render(
        <AppProvider>
          <div data-testid="child">Hello</div>
        </AppProvider>
      );

      // Assert
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByTestId('child').textContent).toBe('Hello');
    });

    it('should render multiple children', () => {
      // Arrange & Act
      render(
        <AppProvider>
          <div data-testid="first">First</div>
          <div data-testid="second">Second</div>
        </AppProvider>
      );

      // Assert
      expect(screen.getByTestId('first')).toBeInTheDocument();
      expect(screen.getByTestId('second')).toBeInTheDocument();
    });
  });

  describe('useApp hook', () => {
    it('should return state and dispatch', () => {
      // Arrange
      let hookResult: ReturnType<typeof useApp> | null = null;

      function Spy() {
        hookResult = useApp();
        return null;
      }

      // Act
      render(
        <AppProvider>
          <Spy />
        </AppProvider>
      );

      // Assert
      expect(hookResult).not.toBeNull();
      expect(hookResult!.state).toBeDefined();
      expect(hookResult!.dispatch).toBeDefined();
      expect(typeof hookResult!.dispatch).toBe('function');
    });
  });

  describe('Initial state', () => {
    it('should have selectedWorkflow set to t2i', () => {
      // Arrange & Act
      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      // Assert
      expect(screen.getByTestId('workflow').textContent).toBe('t2i');
    });

    it('should have an empty or predefined gallery array', () => {
      // Arrange & Act
      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      // Assert
      const count = parseInt(
        screen.getByTestId('gallery-count').textContent ?? '0',
        10
      );
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('SET_WORKFLOW action', () => {
    it('should change selectedWorkflow', () => {
      // Arrange
      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      // Pre-assert
      expect(screen.getByTestId('workflow').textContent).toBe('t2i');

      // Act
      act(() => {
        screen.getByTestId('set-workflow').click();
      });

      // Assert
      expect(screen.getByTestId('workflow').textContent).toBe('upscale');
    });
  });

  describe('SET_MODEL action', () => {
    it('should change selectedModel', () => {
      // Arrange
      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      // Act
      act(() => {
        screen.getByTestId('set-model').click();
      });

      // Assert
      expect(screen.getByTestId('model').textContent).toBe('flux');
    });
  });

  describe('ADD_TO_GALLERY action', () => {
    it('should add a card to gallery', () => {
      // Arrange
      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      const initialCount = parseInt(
        screen.getByTestId('gallery-count').textContent ?? '0',
        10
      );

      // Act
      act(() => {
        screen.getByTestId('add-gallery').click();
      });

      // Assert
      const newCount = parseInt(
        screen.getByTestId('gallery-count').textContent ?? '0',
        10
      );
      expect(newCount).toBe(initialCount + 1);
    });
  });

  describe('Immutability', () => {
    it('should produce a new state object reference on SET_WORKFLOW', () => {
      // Arrange
      let stateRefs: object[] = [];

      function StateTracker() {
        const { state, dispatch } = useApp();
        stateRefs = [...stateRefs, state];
        return (
          <button
            data-testid="trigger"
            onClick={() =>
              dispatch({
                type: 'SET_WORKFLOW',
                payload: 'inpaint' as WorkflowType,
              })
            }
          >
            Trigger
          </button>
        );
      }

      render(
        <AppProvider>
          <StateTracker />
        </AppProvider>
      );

      const initialState = stateRefs[0];

      // Act
      act(() => {
        screen.getByTestId('trigger').click();
      });

      // Assert - state object reference should change
      const updatedState = stateRefs[stateRefs.length - 1];
      expect(updatedState).not.toBe(initialState);
    });

    it('should produce a new gallery array reference on ADD_TO_GALLERY', () => {
      // Arrange
      let galleryRefs: readonly GalleryCard[][] = [];

      function GalleryTracker() {
        const { state, dispatch } = useApp();
        galleryRefs = [...galleryRefs, state.gallery];
        return (
          <button
            data-testid="add-btn"
            onClick={() =>
              dispatch({
                type: 'ADD_TO_GALLERY',
                payload: {
                  id: 'immutability-test',
                  imageUrl: 'https://example.com/test.png',
                  prompt: 'Immutability test',
                  author: 'tester',
                  model: 'sdxl',
                  workflow: 't2i',
                  likes: 0,
                  createdAt: '2025-02-24T00:00:00Z',
                } satisfies GalleryCard,
              })
            }
          >
            Add
          </button>
        );
      }

      render(
        <AppProvider>
          <GalleryTracker />
        </AppProvider>
      );

      const initialGallery = galleryRefs[0];

      // Act
      act(() => {
        screen.getByTestId('add-btn').click();
      });

      // Assert - gallery array reference should change (immutable update)
      const updatedGallery = galleryRefs[galleryRefs.length - 1];
      expect(updatedGallery).not.toBe(initialGallery);
    });
  });
});

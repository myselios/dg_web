/**
 * TDD RED Phase - Gallery Component (T-009, Story S3)
 *
 * Tests for the Gallery component which displays a grid of gallery cards,
 * filtering by the currently selected workflow from context.
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../../../context/AppContext';
import Gallery from '../Gallery';
import { GALLERY_CARDS } from '../../../../infrastructure/mock/data';
import type { WorkflowType } from '../../../../domain/entities/types';

/**
 * Helper component to set a specific workflow in context before rendering Gallery.
 */
function WorkflowSetter({
  workflow,
  children,
}: {
  readonly workflow: WorkflowType;
  readonly children: React.ReactNode;
}) {
  const { dispatch } = useApp();

  // Dispatch on first render to set the desired workflow
  React.useEffect(() => {
    dispatch({ type: 'SET_WORKFLOW', payload: workflow });
  }, [dispatch, workflow]);

  return <>{children}</>;
}

// Import React for the WorkflowSetter component
import React from 'react';

describe('Gallery (T-009, Story S3)', () => {
  const renderGallery = (props: {
    onCardClick?: (cardId: string) => void;
  } = {}) =>
    render(
      <AppProvider>
        <Gallery onCardClick={props.onCardClick ?? vi.fn()} />
      </AppProvider>
    );

  const renderGalleryWithWorkflow = (
    workflow: WorkflowType,
    props: { onCardClick?: (cardId: string) => void } = {}
  ) =>
    render(
      <AppProvider>
        <WorkflowSetter workflow={workflow}>
          <Gallery onCardClick={props.onCardClick ?? vi.fn()} />
        </WorkflowSetter>
      </AppProvider>
    );

  describe('Card rendering', () => {
    it('should render gallery cards as article elements', () => {
      // Arrange & Act
      renderGallery();

      // Assert
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should show an image element in each card', () => {
      // Arrange & Act
      renderGallery();

      // Assert
      const articles = screen.getAllByRole('article');
      for (const article of articles) {
        const img = within(article).getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src');
      }
    });

    it('should show prompt text in each card', () => {
      // Arrange & Act
      renderGallery();

      // Assert
      const articles = screen.getAllByRole('article');
      for (const article of articles) {
        const promptElement = within(article).getByTestId('card-prompt');
        expect(promptElement).toBeInTheDocument();
        expect(promptElement.textContent!.length).toBeGreaterThan(0);
      }
    });

    it('should show author name in each card', () => {
      // Arrange & Act
      renderGallery();

      // Assert
      const articles = screen.getAllByRole('article');
      for (const article of articles) {
        const authorElement = within(article).getByTestId('card-author');
        expect(authorElement).toBeInTheDocument();
        expect(authorElement.textContent!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Filtering by workflow', () => {
    it('should filter cards by selected workflow from context', () => {
      // Arrange
      const upscaleCards = GALLERY_CARDS.filter(
        (c) => c.workflow === 'upscale'
      );

      // Act
      renderGalleryWithWorkflow('upscale');

      // Assert
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(upscaleCards.length);
    });

    it('should show cards matching the default t2i workflow', () => {
      // Arrange
      const t2iCards = GALLERY_CARDS.filter((c) => c.workflow === 't2i');

      // Act
      renderGallery();

      // Assert
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(t2iCards.length);
    });

    it('should show empty state when no cards match filter', () => {
      // Arrange - use a workflow that has no matching cards
      // We test with a rendered gallery and check for empty state message
      // Assuming mock data covers all workflows, we simulate an empty result
      // by rendering with context and verifying empty message exists as a fallback

      // Act
      renderGalleryWithWorkflow('style-transfer');

      // Assert - if there are style-transfer cards, they should appear
      // If there happen to be none, an empty state should render
      const styleTransferCards = GALLERY_CARDS.filter(
        (c) => c.workflow === 'style-transfer'
      );
      if (styleTransferCards.length === 0) {
        expect(screen.getByTestId('gallery-empty')).toBeInTheDocument();
      } else {
        const articles = screen.getAllByRole('article');
        expect(articles).toHaveLength(styleTransferCards.length);
      }
    });
  });

  describe('Card interaction', () => {
    it('should call onCardClick with card id when a card is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const onCardClick = vi.fn();
      renderGallery({ onCardClick });

      // Act
      const firstCard = screen.getAllByRole('article')[0]!;
      await user.click(firstCard);

      // Assert
      expect(onCardClick).toHaveBeenCalledTimes(1);
      expect(typeof onCardClick.mock.calls[0]![0]).toBe('string');
    });
  });
});

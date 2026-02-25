/**
 * TDD RED Phase - StyleGuideModal Component (T-011, Story S6)
 *
 * Tests for the StyleGuideModal component which shows a 10-slide tip carousel
 * with navigation, indicator dots, keyboard support, and ESC close.
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AppProvider, useApp } from '../../../context/AppContext';
import StyleGuideModal from '../StyleGuideModal';

/**
 * Helper component that opens the style guide via context dispatch,
 * so StyleGuideModal renders in "open" state.
 */
function StyleGuideOpener({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { dispatch } = useApp();

  React.useEffect(() => {
    dispatch({ type: 'OPEN_STYLE_GUIDE' });
  }, [dispatch]);

  return <>{children}</>;
}

/**
 * Helper component to observe whether style guide is open in context.
 */
function StyleGuideStateObserver() {
  const { state } = useApp();
  return (
    <span data-testid="style-guide-open">
      {String(state.isStyleGuideOpen)}
    </span>
  );
}

describe('StyleGuideModal (T-011, Story S6)', () => {
  const renderModalClosed = () =>
    render(
      <AppProvider>
        <StyleGuideModal />
      </AppProvider>
    );

  const renderModalOpen = () =>
    render(
      <AppProvider>
        <StyleGuideOpener>
          <StyleGuideModal />
          <StyleGuideStateObserver />
        </StyleGuideOpener>
      </AppProvider>
    );

  describe('Visibility', () => {
    it('should not render when isStyleGuideOpen is false in context', () => {
      // Arrange & Act
      renderModalClosed();

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal when isStyleGuideOpen is true', () => {
      // Arrange & Act
      renderModalOpen();

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should show slide content with tip text', () => {
      // Arrange & Act
      renderModalOpen();

      // Assert
      const slideContent = screen.getByTestId('slide-content');
      expect(slideContent).toBeInTheDocument();
      expect(slideContent.textContent!.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation buttons', () => {
    it('should have a next navigation button', () => {
      // Arrange & Act
      renderModalOpen();

      // Assert
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();
    });

    it('should have a previous navigation button', () => {
      // Arrange & Act
      renderModalOpen();

      // Assert
      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeInTheDocument();
    });
  });

  describe('Indicator dots', () => {
    it('should have 10 indicator dots for 10 slides', () => {
      // Arrange & Act
      renderModalOpen();

      // Assert
      const dots = screen.getAllByTestId(/^dot-/);
      expect(dots).toHaveLength(10);
    });
  });

  describe('Slide navigation', () => {
    it('should advance slide when next button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      renderModalOpen();

      // Pre-assert: first dot is active
      const firstDot = screen.getByTestId('dot-0');
      expect(firstDot).toHaveAttribute('aria-current', 'true');

      // Act
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Assert: second dot becomes active
      const secondDot = screen.getByTestId('dot-1');
      expect(secondDot).toHaveAttribute('aria-current', 'true');
      expect(firstDot).toHaveAttribute('aria-current', 'false');
    });
  });

  describe('Keyboard navigation', () => {
    it('should advance slide when ArrowRight key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      renderModalOpen();

      // Pre-assert: first dot is active
      const firstDot = screen.getByTestId('dot-0');
      expect(firstDot).toHaveAttribute('aria-current', 'true');

      // Act
      await user.keyboard('{ArrowRight}');

      // Assert: second dot becomes active
      const secondDot = screen.getByTestId('dot-1');
      expect(secondDot).toHaveAttribute('aria-current', 'true');
    });
  });

  describe('Close behavior', () => {
    it('should close modal when Escape key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      renderModalOpen();

      // Pre-assert: modal is visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Act
      await user.keyboard('{Escape}');

      // Assert: modal should be closed (dispatches CLOSE_STYLE_GUIDE)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

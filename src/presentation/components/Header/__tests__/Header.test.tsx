/**
 * TDD RED Phase - Header Component (T-007, Story S1)
 *
 * Tests for the Header component which displays app title, queue status,
 * profile avatar, and action buttons (style guide, search, history).
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../../context/AppContext';
import Header from '../Header';

describe('Header (T-007, Story S1)', () => {
  const renderHeader = (props: {
    onSearchClick?: () => void;
    onHistoryClick?: () => void;
  } = {}) =>
    render(
      <AppProvider>
        <Header
          onSearchClick={props.onSearchClick ?? vi.fn()}
          onHistoryClick={props.onHistoryClick ?? vi.fn()}
        />
      </AppProvider>
    );

  describe('Title', () => {
    it('should render FutureLens Visual title text', () => {
      // Arrange & Act
      renderHeader();

      // Assert
      expect(screen.getByText(/FutureLens Visual/i)).toBeInTheDocument();
    });
  });

  describe('Queue status', () => {
    it('should show queue status badge', () => {
      // Arrange & Act
      renderHeader();

      // Assert
      const badge = screen.getByTestId('queue-status');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Profile', () => {
    it('should show profile avatar area', () => {
      // Arrange & Act
      renderHeader();

      // Assert
      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('should have a style guide button with correct aria-label', () => {
      // Arrange & Act
      renderHeader();

      // Assert
      const styleGuideButton = screen.getByRole('button', {
        name: 'Open style guide',
      });
      expect(styleGuideButton).toBeInTheDocument();
    });

    it('should have a search button with correct aria-label', () => {
      // Arrange & Act
      renderHeader();

      // Assert
      const searchButton = screen.getByRole('button', {
        name: 'Search',
      });
      expect(searchButton).toBeInTheDocument();
    });

    it('should have a history button with correct aria-label', () => {
      // Arrange & Act
      renderHeader();

      // Assert
      const historyButton = screen.getByRole('button', {
        name: 'History',
      });
      expect(historyButton).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onSearchClick when search icon is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSearchClick = vi.fn();
      renderHeader({ onSearchClick });

      // Act
      const searchButton = screen.getByRole('button', { name: 'Search' });
      await user.click(searchButton);

      // Assert
      expect(onSearchClick).toHaveBeenCalledTimes(1);
    });

    it('should call onHistoryClick when history icon is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const onHistoryClick = vi.fn();
      renderHeader({ onHistoryClick });

      // Act
      const historyButton = screen.getByRole('button', { name: 'History' });
      await user.click(historyButton);

      // Assert
      expect(onHistoryClick).toHaveBeenCalledTimes(1);
    });
  });
});

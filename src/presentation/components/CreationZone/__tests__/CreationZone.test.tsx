/**
 * TDD RED Phase - CreationZone Component (T-010, Story S4)
 *
 * Tests for the CreationZone component which provides prompt input,
 * file upload, model selection dropdown, and generate button.
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../../context/AppContext';
import CreationZone from '../CreationZone';

describe('CreationZone (T-010, Story S4)', () => {
  const renderCreationZone = () =>
    render(
      <AppProvider>
        <CreationZone />
      </AppProvider>
    );

  describe('Prompt input', () => {
    it('should render a textarea for prompt input', () => {
      // Arrange & Act
      renderCreationZone();

      // Assert
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('should have placeholder text on the textarea', () => {
      // Arrange & Act
      renderCreationZone();

      // Assert
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder');
      expect(
        (textarea as HTMLTextAreaElement).placeholder.length
      ).toBeGreaterThan(0);
    });
  });

  describe('File upload', () => {
    it('should have a file upload button (+ button)', () => {
      // Arrange & Act
      renderCreationZone();

      // Assert
      const uploadButton = screen.getByRole('button', {
        name: /upload|add file|\+/i,
      });
      expect(uploadButton).toBeInTheDocument();
    });
  });

  describe('Model selection', () => {
    it('should have a model selection dropdown button', () => {
      // Arrange & Act
      renderCreationZone();

      // Assert
      const modelButton = screen.getByTestId('model-select-button');
      expect(modelButton).toBeInTheDocument();
    });

    it('should show dropdown options when model button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      renderCreationZone();

      // Act
      const modelButton = screen.getByTestId('model-select-button');
      await user.click(modelButton);

      // Assert
      const dropdown = screen.getByTestId('model-dropdown');
      expect(dropdown).toBeInTheDocument();
      expect(dropdown).toBeVisible();
    });

    it('should show at least 4 model options in dropdown', async () => {
      // Arrange
      const user = userEvent.setup();
      renderCreationZone();

      // Act
      const modelButton = screen.getByTestId('model-select-button');
      await user.click(modelButton);

      // Assert
      const dropdown = screen.getByTestId('model-dropdown');
      const options = within(dropdown).getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Generate button', () => {
    it('should have a generate button with correct aria-label', () => {
      // Arrange & Act
      renderCreationZone();

      // Assert
      const generateButton = screen.getByRole('button', {
        name: 'Generate image',
      });
      expect(generateButton).toBeInTheDocument();
    });

    it('should disable generate button when prompt is empty', () => {
      // Arrange & Act
      renderCreationZone();

      // Assert
      const generateButton = screen.getByRole('button', {
        name: 'Generate image',
      });
      expect(generateButton).toBeDisabled();
    });

    it('should enable generate button when text is typed in textarea', async () => {
      // Arrange
      const user = userEvent.setup();
      renderCreationZone();

      // Act
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A futuristic cityscape at sunset');

      // Assert
      const generateButton = screen.getByRole('button', {
        name: 'Generate image',
      });
      expect(generateButton).toBeEnabled();
    });
  });
});

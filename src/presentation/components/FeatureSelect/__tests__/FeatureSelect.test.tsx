/**
 * TDD RED Phase - FeatureSelect Component (T-008, Story S2)
 *
 * Tests for the FeatureSelect component which renders 5 workflow tabs
 * and dispatches SET_WORKFLOW actions to change the active workflow.
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../../../context/AppContext';
import FeatureSelect from '../FeatureSelect';

/**
 * Helper component to observe the current selectedWorkflow from context.
 */
function WorkflowObserver() {
  const { state } = useApp();
  return <span data-testid="current-workflow">{state.selectedWorkflow}</span>;
}

describe('FeatureSelect (T-008, Story S2)', () => {
  const WORKFLOW_LABELS = [
    'Text to Image',
    'Upscale',
    '2D to 3D',
    'Inpaint',
    'Style Transfer',
  ] as const;

  const renderFeatureSelect = () =>
    render(
      <AppProvider>
        <FeatureSelect />
        <WorkflowObserver />
      </AppProvider>
    );

  describe('Rendering', () => {
    it('should render all 5 workflow tabs', () => {
      // Arrange & Act
      renderFeatureSelect();

      // Assert
      for (const label of WORKFLOW_LABELS) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    });

    it('should render tabs as accessible tab elements', () => {
      // Arrange & Act
      renderFeatureSelect();

      // Assert
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
    });
  });

  describe('Default state', () => {
    it('should have Text to Image tab active by default', () => {
      // Arrange & Act
      renderFeatureSelect();

      // Assert
      const t2iTab = screen.getByRole('tab', { name: 'Text to Image' });
      expect(t2iTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should not have other tabs active by default', () => {
      // Arrange & Act
      renderFeatureSelect();

      // Assert
      const upscaleTab = screen.getByRole('tab', { name: 'Upscale' });
      expect(upscaleTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Tab interactions', () => {
    it('should change active state when a tab is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      renderFeatureSelect();

      // Act
      const upscaleTab = screen.getByRole('tab', { name: 'Upscale' });
      await user.click(upscaleTab);

      // Assert
      expect(upscaleTab).toHaveAttribute('aria-selected', 'true');
      const t2iTab = screen.getByRole('tab', { name: 'Text to Image' });
      expect(t2iTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should dispatch SET_WORKFLOW action and update context state', async () => {
      // Arrange
      const user = userEvent.setup();
      renderFeatureSelect();

      // Pre-assert: default workflow is t2i
      expect(screen.getByTestId('current-workflow').textContent).toBe('t2i');

      // Act
      const upscaleTab = screen.getByRole('tab', { name: 'Upscale' });
      await user.click(upscaleTab);

      // Assert: context state should reflect new workflow
      expect(screen.getByTestId('current-workflow').textContent).toBe(
        'upscale'
      );
    });

    it('should update context when clicking Inpaint tab', async () => {
      // Arrange
      const user = userEvent.setup();
      renderFeatureSelect();

      // Act
      const inpaintTab = screen.getByRole('tab', { name: 'Inpaint' });
      await user.click(inpaintTab);

      // Assert
      expect(screen.getByTestId('current-workflow').textContent).toBe(
        'inpaint'
      );
    });
  });
});

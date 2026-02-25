/**
 * TDD RED Phase - Mock Data (T-004)
 *
 * Tests for mock data constants.
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect } from 'vitest';
import {
  COMFY_MODELS,
  GALLERY_CARDS,
  STYLE_GUIDE_TIPS,
  WORKFLOW_LABELS,
} from '../data';
import type { WorkflowType } from '../../../domain/entities/types';

describe('Mock Data (T-004)', () => {
  describe('COMFY_MODELS', () => {
    it('should have at least 4 models', () => {
      // Act & Assert
      expect(COMFY_MODELS.length).toBeGreaterThanOrEqual(4);
    });

    it('should have id field on each model', () => {
      // Act & Assert
      for (const model of COMFY_MODELS) {
        expect(model.id).toBeDefined();
        expect(typeof model.id).toBe('string');
        expect(model.id.length).toBeGreaterThan(0);
      }
    });

    it('should have name field on each model', () => {
      // Act & Assert
      for (const model of COMFY_MODELS) {
        expect(model.name).toBeDefined();
        expect(typeof model.name).toBe('string');
        expect(model.name.length).toBeGreaterThan(0);
      }
    });

    it('should have description field on each model', () => {
      // Act & Assert
      for (const model of COMFY_MODELS) {
        expect(model.description).toBeDefined();
        expect(typeof model.description).toBe('string');
        expect(model.description.length).toBeGreaterThan(0);
      }
    });

    it('should have unique ids across all models', () => {
      // Arrange
      const ids = COMFY_MODELS.map((m) => m.id);

      // Act & Assert
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('GALLERY_CARDS', () => {
    it('should have at least 12 cards', () => {
      // Act & Assert
      expect(GALLERY_CARDS.length).toBeGreaterThanOrEqual(12);
    });

    it('should have valid imageUrl starting with https:// on each card', () => {
      // Act & Assert
      for (const card of GALLERY_CARDS) {
        expect(card.imageUrl).toBeDefined();
        expect(card.imageUrl.startsWith('https://')).toBe(true);
      }
    });

    it('should have required fields on each card', () => {
      // Act & Assert
      for (const card of GALLERY_CARDS) {
        expect(card.id).toBeDefined();
        expect(card.prompt).toBeDefined();
        expect(card.author).toBeDefined();
        expect(card.model).toBeDefined();
        expect(card.workflow).toBeDefined();
        expect(card.likes).toBeDefined();
        expect(card.createdAt).toBeDefined();
      }
    });

    it('should cover all 5 workflow types', () => {
      // Arrange
      const expectedWorkflows: readonly WorkflowType[] = [
        't2i',
        'upscale',
        '2d-to-3d',
        'inpaint',
        'style-transfer',
      ];
      const cardWorkflows = new Set(GALLERY_CARDS.map((c) => c.workflow));

      // Act & Assert
      for (const workflow of expectedWorkflows) {
        expect(cardWorkflows.has(workflow)).toBe(true);
      }
    });

    it('should have unique ids across all cards', () => {
      // Arrange
      const ids = GALLERY_CARDS.map((c) => c.id);

      // Act & Assert
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have non-negative likes on each card', () => {
      // Act & Assert
      for (const card of GALLERY_CARDS) {
        expect(card.likes).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have non-empty prompt on each card', () => {
      // Act & Assert
      for (const card of GALLERY_CARDS) {
        expect(typeof card.prompt).toBe('string');
        expect(card.prompt.length).toBeGreaterThan(0);
      }
    });
  });

  describe('STYLE_GUIDE_TIPS', () => {
    it('should have exactly 10 items', () => {
      // Act & Assert
      expect(STYLE_GUIDE_TIPS).toHaveLength(10);
    });

    it('should have non-empty string content for each tip', () => {
      // Act & Assert
      for (const tip of STYLE_GUIDE_TIPS) {
        expect(typeof tip).toBe('string');
        expect((tip as string).length).toBeGreaterThan(0);
      }
    });
  });

  describe('WORKFLOW_LABELS', () => {
    it('should map all 5 workflow types', () => {
      // Arrange
      const expectedKeys: readonly WorkflowType[] = [
        't2i',
        'upscale',
        '2d-to-3d',
        'inpaint',
        'style-transfer',
      ];

      // Act & Assert
      for (const key of expectedKeys) {
        expect(WORKFLOW_LABELS[key]).toBeDefined();
      }
    });

    it('should have string labels for each workflow type', () => {
      // Arrange
      const keys = Object.keys(WORKFLOW_LABELS);

      // Act & Assert
      expect(keys.length).toBe(5);
      for (const key of keys) {
        expect(typeof WORKFLOW_LABELS[key as WorkflowType]).toBe('string');
        expect(
          (WORKFLOW_LABELS[key as WorkflowType] as string).length
        ).toBeGreaterThan(0);
      }
    });

    it('should have human-readable label for t2i', () => {
      // Act & Assert
      expect(WORKFLOW_LABELS['t2i']).toBeDefined();
      expect(typeof WORKFLOW_LABELS['t2i']).toBe('string');
    });

    it('should have human-readable label for style-transfer', () => {
      // Act & Assert
      expect(WORKFLOW_LABELS['style-transfer']).toBeDefined();
      expect(typeof WORKFLOW_LABELS['style-transfer']).toBe('string');
    });
  });
});

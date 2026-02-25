/**
 * TDD RED Phase - Domain Types (T-002)
 *
 * Tests for domain type definitions.
 * These tests will FAIL because the implementation does not exist yet.
 */
import { describe, it, expect } from 'vitest';
import type {
  WorkflowType,
  GalleryCard,
  ComfyModel,
  GenerationRequest,
} from '../types';

describe('Domain Types (T-002)', () => {
  describe('WorkflowType', () => {
    it('should include t2i as a valid workflow type', () => {
      // Arrange
      const workflow: WorkflowType = 't2i';

      // Act & Assert
      expect(workflow).toBe('t2i');
    });

    it('should include upscale as a valid workflow type', () => {
      // Arrange
      const workflow: WorkflowType = 'upscale';

      // Act & Assert
      expect(workflow).toBe('upscale');
    });

    it('should include 2d-to-3d as a valid workflow type', () => {
      // Arrange
      const workflow: WorkflowType = '2d-to-3d';

      // Act & Assert
      expect(workflow).toBe('2d-to-3d');
    });

    it('should include inpaint as a valid workflow type', () => {
      // Arrange
      const workflow: WorkflowType = 'inpaint';

      // Act & Assert
      expect(workflow).toBe('inpaint');
    });

    it('should include style-transfer as a valid workflow type', () => {
      // Arrange
      const workflow: WorkflowType = 'style-transfer';

      // Act & Assert
      expect(workflow).toBe('style-transfer');
    });

    it('should support all 5 workflow types as a union', () => {
      // Arrange
      const allWorkflows: readonly WorkflowType[] = [
        't2i',
        'upscale',
        '2d-to-3d',
        'inpaint',
        'style-transfer',
      ];

      // Act & Assert
      expect(allWorkflows).toHaveLength(5);
      expect(new Set(allWorkflows).size).toBe(5);
    });
  });

  describe('GalleryCard', () => {
    it('should have all required fields', () => {
      // Arrange
      const card: GalleryCard = {
        id: 'card-001',
        imageUrl: 'https://example.com/image.png',
        prompt: 'A futuristic cityscape',
        author: 'user123',
        model: 'SDXL',
        workflow: 't2i',
        likes: 42,
        createdAt: '2025-02-24T12:00:00Z',
      };

      // Act & Assert
      expect(card.id).toBe('card-001');
      expect(card.imageUrl).toBe('https://example.com/image.png');
      expect(card.prompt).toBe('A futuristic cityscape');
      expect(card.author).toBe('user123');
      expect(card.model).toBe('SDXL');
      expect(card.workflow).toBe('t2i');
      expect(card.likes).toBe(42);
      expect(card.createdAt).toBe('2025-02-24T12:00:00Z');
    });

    it('should accept different workflow types for the workflow field', () => {
      // Arrange
      const card: GalleryCard = {
        id: 'card-002',
        imageUrl: 'https://example.com/upscaled.png',
        prompt: 'Upscaled portrait',
        author: 'artist42',
        model: 'SD 1.5',
        workflow: 'upscale',
        likes: 10,
        createdAt: '2025-02-23T08:30:00Z',
      };

      // Act & Assert
      expect(card.workflow).toBe('upscale');
    });
  });

  describe('ComfyModel', () => {
    it('should have id, name, and description fields', () => {
      // Arrange
      const model: ComfyModel = {
        id: 'sdxl',
        name: 'SDXL',
        description: 'Stable Diffusion XL - high quality image generation',
      };

      // Act & Assert
      expect(model.id).toBe('sdxl');
      expect(model.name).toBe('SDXL');
      expect(model.description).toBe(
        'Stable Diffusion XL - high quality image generation'
      );
    });
  });

  describe('GenerationRequest', () => {
    it('should have prompt, model, and workflow fields', () => {
      // Arrange
      const request: GenerationRequest = {
        prompt: 'A beautiful sunset over mountains',
        model: 'sdxl',
        workflow: 't2i',
      };

      // Act & Assert
      expect(request.prompt).toBe('A beautiful sunset over mountains');
      expect(request.model).toBe('sdxl');
      expect(request.workflow).toBe('t2i');
    });

    it('should accept any valid workflow type', () => {
      // Arrange
      const request: GenerationRequest = {
        prompt: 'Transfer this style',
        model: 'flux',
        workflow: 'style-transfer',
      };

      // Act & Assert
      expect(request.workflow).toBe('style-transfer');
      expect(request.prompt).toBeTruthy();
      expect(request.model).toBeTruthy();
    });
  });

  describe('Type exports', () => {
    it('should export WorkflowType', () => {
      // Assert - if the type import works, this value assignment compiles
      const value: WorkflowType = 't2i';
      expect(value).toBeDefined();
    });

    it('should export GalleryCard', () => {
      // Assert
      const card: GalleryCard = {
        id: '1',
        imageUrl: 'https://example.com/img.png',
        prompt: 'test',
        author: 'test',
        model: 'test',
        workflow: 't2i',
        likes: 0,
        createdAt: '2025-01-01',
      };
      expect(card).toBeDefined();
    });

    it('should export ComfyModel', () => {
      // Assert
      const model: ComfyModel = {
        id: '1',
        name: 'Test',
        description: 'Test model',
      };
      expect(model).toBeDefined();
    });

    it('should export GenerationRequest', () => {
      // Assert
      const request: GenerationRequest = {
        prompt: 'test',
        model: 'test',
        workflow: 't2i',
      };
      expect(request).toBeDefined();
    });
  });
});

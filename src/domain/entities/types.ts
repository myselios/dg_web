export const WORKFLOW_TYPES = ['t2i', 'upscale', '2d-to-3d', 'inpaint', 'style-transfer'] as const;
export type WorkflowType = (typeof WORKFLOW_TYPES)[number];

export interface ComfyModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface GalleryCard {
  readonly id: string;
  readonly imageUrl: string;
  readonly prompt: string;
  readonly author: string;
  readonly model: string;
  readonly workflow: WorkflowType;
  readonly likes: number;
  readonly createdAt: string;
}

export interface GenerationRequest {
  readonly prompt: string;
  readonly model: string;
  readonly workflow: WorkflowType;
}

export interface GenerationResult {
  readonly imageUrl: string;
  readonly status: 'success' | 'error';
  readonly error?: string;
}

export interface QueueStatus {
  readonly pending: number;
  readonly processing: number;
}

export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

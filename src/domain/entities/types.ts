/* ── Domain Types ── */

export type WorkflowType =
  | 'text-to-image'
  | 'upscale'
  | '2d-to-3d'
  | 'inpaint'
  | 'style-transfer';

export type GenerationStatus = 'idle' | 'queued' | 'generating' | 'completed' | 'failed';

export type ModelId = 'sdxl' | 'sd15' | 'flux' | 'juggernaut';

export interface ComfyModel {
  readonly id: ModelId;
  readonly name: string;
  readonly description: string;
  readonly status: 'online' | 'loading' | 'offline';
}

export interface GalleryCard {
  readonly id: string;
  readonly imageUrl: string;
  readonly prompt: string;
  readonly model: ModelId;
  readonly workflow: WorkflowType;
  readonly createdAt: string;
  readonly author: string;
  readonly likes: number;
}

export interface GenerationRequest {
  readonly prompt: string;
  readonly model: ModelId;
  readonly workflow: WorkflowType;
  readonly referenceImageUrl?: string;
}

export interface GenerationResult {
  readonly id: string;
  readonly imageUrl: string;
  readonly prompt: string;
  readonly model: ModelId;
  readonly workflow: WorkflowType;
  readonly createdAt: string;
}

export interface QueueStatus {
  readonly pending: number;
  readonly processing: number;
}

export interface UserProfile {
  readonly name: string;
  readonly avatar: string;
}

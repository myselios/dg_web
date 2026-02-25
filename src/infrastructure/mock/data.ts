/**
 * Mock Data (T-004)
 *
 * Static mock data for development and testing.
 */
import type { ComfyModel, GalleryCard, WorkflowType } from '../../domain/entities/types';

export const COMFY_MODELS: readonly ComfyModel[] = [
  {
    id: 'sdxl-1.0',
    name: 'Stable Diffusion XL 1.0',
    description: 'High-resolution image generation with excellent prompt adherence',
  },
  {
    id: 'flux-dev',
    name: 'FLUX.1 Dev',
    description: 'Fast and high-quality text-to-image generation model',
  },
  {
    id: 'sd-3.5-medium',
    name: 'Stable Diffusion 3.5 Medium',
    description: 'Balanced model offering quality and speed for general-purpose generation',
  },
  {
    id: 'playground-v2.5',
    name: 'Playground v2.5',
    description: 'Community-favorite model optimized for aesthetic and artistic outputs',
  },
] as const;

export const GALLERY_CARDS: readonly GalleryCard[] = [
  {
    id: 'card-001',
    imageUrl: 'https://picsum.photos/seed/sunset-mountain/512/512',
    prompt: 'A breathtaking sunset over mountain peaks with golden clouds',
    author: 'alice',
    model: 'sdxl-1.0',
    workflow: 't2i',
    likes: 142,
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'card-002',
    imageUrl: 'https://picsum.photos/seed/cyber-city/512/512',
    prompt: 'Futuristic cyberpunk city at night with neon reflections',
    author: 'bob',
    model: 'flux-dev',
    workflow: 't2i',
    likes: 98,
    createdAt: '2025-12-02T14:30:00Z',
  },
  {
    id: 'card-003',
    imageUrl: 'https://picsum.photos/seed/ocean-4k/1024/1024',
    prompt: 'Deep ocean scene upscaled to ultra high resolution',
    author: 'carol',
    model: 'sdxl-1.0',
    workflow: 'upscale',
    likes: 67,
    createdAt: '2025-12-03T09:15:00Z',
  },
  {
    id: 'card-004',
    imageUrl: 'https://picsum.photos/seed/forest-up/1024/1024',
    prompt: 'Ancient forest pathway enhanced with 4x upscaling',
    author: 'dave',
    model: 'sd-3.5-medium',
    workflow: 'upscale',
    likes: 53,
    createdAt: '2025-12-04T16:45:00Z',
  },
  {
    id: 'card-005',
    imageUrl: 'https://picsum.photos/seed/robot-3d/512/512',
    prompt: 'Steampunk robot rendered as a 3D model from 2D sketch',
    author: 'eve',
    model: 'flux-dev',
    workflow: '2d-to-3d',
    likes: 210,
    createdAt: '2025-12-05T11:00:00Z',
  },
  {
    id: 'card-006',
    imageUrl: 'https://picsum.photos/seed/castle-3d/512/512',
    prompt: 'Medieval castle converted from illustration to 3D perspective',
    author: 'frank',
    model: 'sdxl-1.0',
    workflow: '2d-to-3d',
    likes: 175,
    createdAt: '2025-12-06T08:20:00Z',
  },
  {
    id: 'card-007',
    imageUrl: 'https://picsum.photos/seed/face-fix/512/512',
    prompt: 'Portrait with background replaced using inpainting',
    author: 'grace',
    model: 'playground-v2.5',
    workflow: 'inpaint',
    likes: 89,
    createdAt: '2025-12-07T13:10:00Z',
  },
  {
    id: 'card-008',
    imageUrl: 'https://picsum.photos/seed/room-edit/512/512',
    prompt: 'Living room with furniture removed and repainted wall',
    author: 'henry',
    model: 'sdxl-1.0',
    workflow: 'inpaint',
    likes: 45,
    createdAt: '2025-12-08T17:55:00Z',
  },
  {
    id: 'card-009',
    imageUrl: 'https://picsum.photos/seed/oil-paint/512/512',
    prompt: 'Photograph transformed into oil painting style',
    author: 'iris',
    model: 'flux-dev',
    workflow: 'style-transfer',
    likes: 312,
    createdAt: '2025-12-09T07:30:00Z',
  },
  {
    id: 'card-010',
    imageUrl: 'https://picsum.photos/seed/anime-style/512/512',
    prompt: 'City street photo converted to anime art style',
    author: 'jack',
    model: 'sd-3.5-medium',
    workflow: 'style-transfer',
    likes: 256,
    createdAt: '2025-12-10T12:00:00Z',
  },
  {
    id: 'card-011',
    imageUrl: 'https://picsum.photos/seed/galaxy-gen/512/512',
    prompt: 'Spiral galaxy with vibrant nebula colors',
    author: 'kate',
    model: 'sdxl-1.0',
    workflow: 't2i',
    likes: 188,
    createdAt: '2025-12-11T15:40:00Z',
  },
  {
    id: 'card-012',
    imageUrl: 'https://picsum.photos/seed/dragon-art/512/512',
    prompt: 'Fire-breathing dragon in a watercolor art style',
    author: 'leo',
    model: 'playground-v2.5',
    workflow: 'style-transfer',
    likes: 401,
    createdAt: '2025-12-12T19:25:00Z',
  },
] as const;

export const STYLE_GUIDE_TIPS: readonly string[] = [
  'Use descriptive adjectives to set the mood and atmosphere of your scene.',
  'Specify the camera angle or perspective for more controlled compositions.',
  'Include lighting details like "golden hour", "dramatic shadows", or "soft ambient light".',
  'Reference specific art styles such as "impressionist", "art deco", or "ukiyo-e".',
  'Add material and texture descriptors like "marble", "weathered wood", or "glossy ceramic".',
  'Use negative prompts to exclude unwanted elements from the generated image.',
  'Specify the resolution and aspect ratio to match your intended output format.',
  'Combine multiple style references for unique hybrid aesthetics.',
  'Describe foreground and background separately for better depth and layering.',
  'Experiment with weight syntax to emphasize or de-emphasize specific prompt tokens.',
] as const;

export const WORKFLOW_LABELS: Readonly<Record<WorkflowType, string>> = {
  't2i': 'Text to Image',
  'upscale': 'Upscale',
  '2d-to-3d': '2D to 3D',
  'inpaint': 'Inpaint',
  'style-transfer': 'Style Transfer',
} as const;

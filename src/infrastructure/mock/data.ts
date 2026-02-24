import type { ComfyModel, GalleryCard, WorkflowType } from '../../domain/entities/types';

export const COMFY_MODELS: readonly ComfyModel[] = [
  {
    id: 'sdxl',
    name: 'Stable Diffusion XL',
    description: 'High-resolution 1024x1024 generation with excellent detail and composition.',
    status: 'online',
  },
  {
    id: 'sd15',
    name: 'Stable Diffusion 1.5',
    description: 'Fast, versatile model for 512x512. Great for prototyping and iteration.',
    status: 'online',
  },
  {
    id: 'flux',
    name: 'Flux.1 Dev',
    description: 'State-of-the-art flow matching model. Exceptional prompt adherence.',
    status: 'loading',
  },
  {
    id: 'juggernaut',
    name: 'Juggernaut XL',
    description: 'Photorealistic specialist. Best for portraits and cinematic scenes.',
    status: 'online',
  },
] as const;

export const WORKFLOW_LABELS: Record<WorkflowType, string> = {
  'text-to-image': 'Text to Image',
  'upscale': 'Upscale',
  '2d-to-3d': '2D to 3D',
  'inpaint': 'Inpaint',
  'style-transfer': 'Style Transfer',
};

const CARD_COUNT = 24;

function buildImageUrl(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const IMAGE_RATIOS: readonly [number, number][] = [
  [600, 800], [600, 600], [600, 750], [600, 600], [600, 900], [600, 600],
  [600, 700], [600, 850], [600, 600], [600, 750], [600, 600], [600, 800],
  [600, 600], [600, 700], [600, 900], [600, 600], [600, 750], [600, 800],
  [600, 600], [600, 850], [600, 600], [600, 700], [600, 600], [600, 750],
];

const PROMPTS = [
  'Ethereal forest with bioluminescent mushrooms, cinematic lighting, volumetric fog',
  'Cyberpunk cityscape at sunset, neon reflections on wet streets, ultra detailed',
  'Portrait of a woman with flowers in her hair, Renaissance painting style',
  'Futuristic spacecraft orbiting a gas giant, concept art, Greg Rutkowski',
  'Minimalist Japanese garden with cherry blossoms, soft morning light',
  'Abstract fluid art, vibrant colors merging, macro photography',
  'Gothic cathedral interior, ray of light through stained glass, 8k',
  'Underwater scene with jellyfish, teal and purple, magical atmosphere',
  'Mountain landscape at golden hour, dramatic clouds, wide angle',
  'Steampunk robot reading a book in a Victorian library',
  'Aurora borealis over a frozen lake, long exposure, photorealistic',
  'Surreal floating islands with waterfalls, fantasy art, Artstation',
  'Vintage car in a moody alleyway, film noir style, rain',
  'Crystal cave with rainbow reflections, fantasy environment',
  'Space station observation deck, Earth visible, cinematic composition',
  'Zen garden with raked sand patterns, minimalist, aerial view',
  'Neon samurai in a rain-soaked Tokyo alley, reflections, cinematic',
  'Ancient temple ruins overgrown with vines, golden light filtering through',
  'Robot bartender mixing cocktails, retro-futuristic diner, warm lighting',
  'Deep sea creature glowing in the abyss, bioluminescence, dark blue',
  'Floating market in Venice on a misty morning, oil painting style',
  'Geometric abstract art with metallic textures, 3D render, octane',
  'Wolf howling at a blood moon, dark fantasy, dramatic silhouette',
  'Cozy cabin interior in winter, fireplace glow, hygge atmosphere',
] as const;

const AUTHORS = [
  'lunar_artist', 'neon_dreams', 'pixel_witch', 'void_render',
  'synth_wave', 'art_nova', 'cosmic_eye', 'deep_canvas',
] as const;

// Balanced distribution: t2i=10, upscale=4, 2d-to-3d=3, inpaint=4, style-transfer=3
const WORKFLOWS: WorkflowType[] = [
  'text-to-image', 'text-to-image', 'upscale',       'text-to-image',
  'inpaint',       'style-transfer', 'text-to-image', '2d-to-3d',
  'text-to-image', 'upscale',        'inpaint',       'text-to-image',
  'style-transfer', '2d-to-3d',      'text-to-image', 'upscale',
  'text-to-image', 'inpaint',        '2d-to-3d',      'text-to-image',
  'upscale',       'style-transfer', 'inpaint',        'text-to-image',
];

const MODEL_IDS: readonly ComfyModel['id'][] = [
  'sdxl', 'flux', 'juggernaut', 'sdxl',
  'sd15', 'sdxl', 'flux', 'juggernaut',
  'sdxl', 'sd15', 'flux', 'sdxl',
  'juggernaut', 'sdxl', 'flux', 'sd15',
  'sdxl', 'flux', 'juggernaut', 'sd15',
  'sdxl', 'flux', 'juggernaut', 'sdxl',
];

export const MOCK_GALLERY: readonly GalleryCard[] = Array.from(
  { length: CARD_COUNT },
  (_, i) => {
    const [w, h] = IMAGE_RATIOS[i];
    return {
      id: `card-${i + 1}`,
      imageUrl: buildImageUrl(`fl${String(i + 1).padStart(2, '0')}`, w, h),
      prompt: PROMPTS[i],
      model: MODEL_IDS[i],
      workflow: WORKFLOWS[i],
      createdAt: new Date(Date.now() - (i + 1) * 1800000).toISOString(),
      author: AUTHORS[i % AUTHORS.length],
      likes: Math.floor(Math.random() * 200) + 10,
    };
  },
);

export const STYLE_GUIDE_TIPS = [
  { title: 'Be Specific', description: 'Use detailed descriptions instead of vague terms. "Golden sunset over ocean waves" beats "nice scenery".' },
  { title: 'Use Art References', description: 'Mention specific art styles: "in the style of Studio Ghibli", "Art Nouveau", "Bauhaus".' },
  { title: 'Lighting Matters', description: 'Specify lighting: "volumetric fog", "rim lighting", "golden hour", "chiaroscuro".' },
  { title: 'Camera & Composition', description: 'Add camera terms: "wide angle", "macro", "bird\'s eye view", "shallow depth of field".' },
  { title: 'Quality Boosters', description: 'Append quality tags: "8k", "ultra detailed", "masterpiece", "photorealistic".' },
  { title: 'Negative Prompts', description: 'Exclude unwanted elements: "no blur", "no watermark", "no text".' },
  { title: 'Color Palette', description: 'Guide colors: "teal and orange", "monochromatic blue", "pastel palette".' },
  { title: 'Mood & Atmosphere', description: 'Set the mood: "ethereal", "dystopian", "whimsical", "melancholic".' },
  { title: 'Material & Texture', description: 'Describe materials: "marble texture", "glass refraction", "worn leather".' },
  { title: 'Iterate & Refine', description: 'Start broad, then refine. Each generation teaches you what works.' },
] as const;

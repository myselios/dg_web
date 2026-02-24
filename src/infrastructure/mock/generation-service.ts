import type { GenerationRequest, GenerationResult } from '../../domain/entities/types';

const SAMPLE_RESULT_IMAGES = [
  'https://picsum.photos/seed/gen01/600/600',
  'https://picsum.photos/seed/gen02/600/600',
  'https://picsum.photos/seed/gen03/600/600',
  'https://picsum.photos/seed/gen04/600/600',
  'https://picsum.photos/seed/gen05/600/600',
];

type ProgressCallback = (progress: number) => void;

const FAILURE_RATE = 0.1;

export function simulateGeneration(
  request: GenerationRequest,
  onProgress: ProgressCallback,
): Promise<GenerationResult> {
  const duration = 1000 + Math.random() * 2000; // 1~3 seconds
  const steps = 20;
  const stepTime = duration / steps;
  const shouldFail = Math.random() < FAILURE_RATE;

  return new Promise((resolve, reject) => {
    let current = 0;

    const tick = () => {
      current += 1;
      const progress = Math.min((current / steps) * 100, 100);
      onProgress(Math.round(progress));

      if (shouldFail && current >= Math.floor(steps * 0.7)) {
        reject(new Error('Generation failed: GPU memory exceeded. Please try again.'));
        return;
      }

      if (current >= steps) {
        const resultImage =
          SAMPLE_RESULT_IMAGES[Math.floor(Math.random() * SAMPLE_RESULT_IMAGES.length)];

        resolve({
          id: `gen-${Date.now()}`,
          imageUrl: resultImage,
          prompt: request.prompt,
          model: request.model,
          workflow: request.workflow,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      setTimeout(tick, stepTime);
    };

    setTimeout(tick, stepTime);
  });
}

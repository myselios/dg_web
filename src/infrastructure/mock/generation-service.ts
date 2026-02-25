/**
 * Mock Generation Service (T-005)
 *
 * Simulates image generation with progress reporting.
 * Duration: 1-3 seconds, 20 progress steps, 10% failure rate.
 */
import type { GenerationRequest, GenerationResult } from '../../domain/entities/types';

const TOTAL_STEPS = 20;
const MIN_DURATION_MS = 1000;
const MAX_DURATION_MS = 3000;
const FAILURE_THRESHOLD = 0.1;

export const simulateGeneration = (
  request: GenerationRequest,
  onProgress: (pct: number) => void,
): Promise<GenerationResult> => {
  const shouldFail = Math.random() < FAILURE_THRESHOLD;
  const durationMs =
    MIN_DURATION_MS + Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS);
  const stepIntervalMs = durationMs / TOTAL_STEPS;

  return new Promise<GenerationResult>((resolve) => {
    let currentStep = 0;

    const tick = (): void => {
      const progress = Math.round((currentStep / TOTAL_STEPS) * 100);
      onProgress(progress);

      if (currentStep >= TOTAL_STEPS) {
        if (shouldFail) {
          resolve({
            imageUrl: '',
            status: 'error',
            error: 'Generation failed: simulated random failure',
          });
        } else {
          const seed = `${request.prompt.replace(/\s+/g, '-').slice(0, 30)}-${Date.now()}`;
          resolve({
            imageUrl: `https://picsum.photos/seed/${seed}/512/512`,
            status: 'success',
          });
        }
        return;
      }

      currentStep = currentStep + 1;
      setTimeout(tick, stepIntervalMs);
    };

    tick();
  });
};

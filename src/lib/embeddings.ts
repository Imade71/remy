import type { FeatureExtractionPipeline } from "@xenova/transformers";

const g = globalThis as typeof globalThis & {
  _embedder?: Promise<FeatureExtractionPipeline>;
};

// Cosine similarity — embeddings are L2-normalised so dot product suffices
export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export async function tryEmbed(text: string): Promise<number[] | null> {
  try {
    if (!g._embedder) {
      const { pipeline } = await import("@xenova/transformers");
      g._embedder = pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      ) as Promise<FeatureExtractionPipeline>;
    }
    const embedder = await g._embedder;
    const result = await embedder(text.slice(0, 512), {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(result.data as Float32Array);
  } catch {
    return null;
  }
}

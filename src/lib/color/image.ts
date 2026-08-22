/**
 * The browser half of image extraction: decode a file, sample it small, hand
 * the pixels to `extractPalette`.
 *
 * Everything happens on a canvas in the page — the image is never uploaded,
 * which is the promise the dialog makes under its drop zone.
 *
 * Sampling down to a short edge is not an optimisation detail: clustering a
 * full-resolution photo would take seconds and give the same answer, because
 * downscaling averages exactly the noise k-means would otherwise have to
 * average itself.
 */
import { extractPalette } from "./extract";

/** Longest edge of the sampled thumbnail, in pixels. */
export const SAMPLE_MAX_EDGE = 140;

/** An SVG without intrinsic dimensions still has to be rasterised at some size. */
const FALLBACK_EDGE = 300;

export interface ImagePalette {
  /** Dominant colors, strongest first, as `#rrggbb`. */
  colors: string[];
  /**
   * The sampled thumbnail as a data URL, for the dialog's preview box.
   *
   * A data URL rather than the original object URL so the caller has nothing to
   * revoke and nothing to leak — and at 140px it costs a few kilobytes however
   * large the file was.
   */
  thumbnail: string | null;
}

function sampleCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const sourceWidth = image.naturalWidth || FALLBACK_EDGE;
  const sourceHeight = image.naturalHeight || FALLBACK_EDGE;
  const scale = Math.min(
    1,
    SAMPLE_MAX_EDGE / Math.max(sourceWidth, sourceHeight)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function readPalette(image: HTMLImageElement): ImagePalette {
  const canvas = sampleCanvas(image);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  return { colors: extractPalette(pixels), thumbnail: canvas.toDataURL() };
}

/**
 * Dominant colors of the image at `url`, plus a thumbnail of what was sampled.
 *
 * Resolves with an empty palette when the image decodes but yields nothing
 * usable — a blank canvas, or an SVG that tainted the canvas by referencing a
 * remote asset. Rejects only when the file is not a decodable image at all.
 */
export function extractFromImage(url: string): Promise<ImagePalette> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        resolve(readPalette(image));
      } catch {
        resolve({ colors: [], thumbnail: null });
      }
    };
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = url;
  });
}

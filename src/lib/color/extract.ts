/**
 * Pulling a palette out of an image.
 *
 * k-means over OKLab, because clustering in a perceptual space groups colors
 * the way an eye does: a logo's blue stays one cluster across its antialiased
 * edges instead of scattering into a hundred near-identical sRGB values.
 *
 * The sRGB → OKLab conversion is written out here rather than routed through
 * `convert`. colorjs parses a string per call and a sampled thumbnail is around
 * twenty thousand pixels; only the handful of cluster centres go back through
 * `oklchToHex`, which is where gamut mapping actually earns its cost.
 *
 * Seeding is farthest-point from the first sampled pixel, so the same image
 * always yields the same candidates — an extraction that reshuffled on every
 * drop would be impossible to trust or to test.
 */
import { oklchToHex } from "./convert";

/** OKLab as a flat triple: lightness, green–red, blue–yellow. */
type LabPoint = readonly [lightness: number, green: number, blue: number];

interface Cluster {
  center: LabPoint;
  count: number;
}

interface Candidate {
  chroma: number;
  hex: string;
  hue: number;
  lightness: number;
  weight: number;
}

/** How many swatches an extraction offers at most. */
export const MAX_EXTRACTED = 6;

const CHANNELS_PER_PIXEL = 4;
const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;

/** Below this the pixel is mostly background showing through — skip it. */
const ALPHA_FLOOR = 200;

/**
 * Near-white and near-black carry no usable hue, and every photo has plenty of
 * both. Dropping them keeps the ranking about the image's colors.
 */
const LIGHTNESS_CEILING = 0.965;
const LIGHTNESS_FLOOR = 0.055;

/** Fewer sampled pixels than this and clustering has nothing to say. */
const MIN_POINTS = 4;

const MAX_CLUSTERS = 8;
const REFINE_PASSES = 8;

/** Seeding scans every third point: same result, a third of the work. */
const SEED_STRIDE = 3;

/**
 * A cluster's pull is its size biased by its chroma, so a small logo mark wins
 * over the large grey field behind it without a grey background ever being
 * excluded outright.
 */
const WEIGHT_FLOOR = 0.2;
const CHROMA_WEIGHT = 4;

/** Under this chroma a color reads as a neutral, and hue stops meaning much. */
const NEUTRAL_CHROMA = 0.035;
const NEUTRAL_LIGHTNESS_GAP = 0.12;
const SIMILAR_HUE_GAP = 22;
const SIMILAR_LIGHTNESS_GAP = 0.18;

const SRGB_MAX = 255;
const GAMMA_THRESHOLD = 0.040_45;
const GAMMA_SLOPE = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_SCALE = 1.055;
const GAMMA_EXPONENT = 2.4;

const CUBE_ROOT = 1 / 3;
const HALF_TURN = 180;
const FULL_TURN = 360;
const DEGREES_PER_RADIAN = HALF_TURN / Math.PI;

function linearize(channel: number): number {
  const value = channel / SRGB_MAX;
  return value <= GAMMA_THRESHOLD
    ? value / GAMMA_SLOPE
    : ((value + GAMMA_OFFSET) / GAMMA_SCALE) ** GAMMA_EXPONENT;
}

/** Björn Ottosson's sRGB → OKLab, inlined. */
function srgbToOklab(red: number, green: number, blue: number): LabPoint {
  const r = linearize(red);
  const g = linearize(green);
  const b = linearize(blue);

  const long =
    (0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_992_9 * b) **
    CUBE_ROOT;
  const medium =
    (0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b) **
    CUBE_ROOT;
  const short =
    (0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b) **
    CUBE_ROOT;

  return [
    0.210_454_255_3 * long + 0.793_617_785 * medium - 0.004_072_046_8 * short,
    1.977_998_495_1 * long - 2.428_592_205 * medium + 0.450_593_709_9 * short,
    0.025_904_037_1 * long + 0.782_771_766_2 * medium - 0.808_675_766 * short,
  ];
}

function squaredDistance(a: LabPoint, b: LabPoint): number {
  const dl = a[0] - b[0];
  const da = a[1] - b[1];
  const db = a[2] - b[2];
  return dl * dl + da * da + db * db;
}

function nearestIndex(point: LabPoint, centers: LabPoint[]): number {
  let index = 0;
  let best = Number.POSITIVE_INFINITY;
  for (const [candidate, center] of centers.entries()) {
    const distance = squaredDistance(point, center);
    if (distance < best) {
      best = distance;
      index = candidate;
    }
  }
  return index;
}

function nearestDistance(point: LabPoint, centers: LabPoint[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const center of centers) {
    const distance = squaredDistance(point, center);
    if (distance < best) {
      best = distance;
    }
  }
  return best;
}

/** Opaque, non-extreme pixels, converted once. */
function samplePoints(pixels: ArrayLike<number>): LabPoint[] {
  const points: LabPoint[] = [];
  for (let i = 0; i + ALPHA < pixels.length; i += CHANNELS_PER_PIXEL) {
    if (pixels[i + ALPHA] < ALPHA_FLOOR) {
      continue;
    }
    const point = srgbToOklab(
      pixels[i + RED],
      pixels[i + GREEN],
      pixels[i + BLUE]
    );
    if (point[0] > LIGHTNESS_CEILING || point[0] < LIGHTNESS_FLOOR) {
      continue;
    }
    points.push(point);
  }
  return points;
}

/** Farthest-point seeding: spread the first centres as wide as the data goes. */
function seedCenters(points: LabPoint[], count: number): LabPoint[] {
  const centers: LabPoint[] = [points[0]];
  while (centers.length < count) {
    let farthest: LabPoint | null = null;
    let farthestDistance = -1;
    for (let i = 0; i < points.length; i += SEED_STRIDE) {
      const distance = nearestDistance(points[i], centers);
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthest = points[i];
      }
    }
    if (!farthest) {
      break;
    }
    centers.push(farthest);
  }
  return centers;
}

function refine(points: LabPoint[], seeds: LabPoint[]): Cluster[] {
  let centers = seeds;
  let counts: number[] = [];

  for (let pass = 0; pass < REFINE_PASSES; pass += 1) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (const point of points) {
      const sum = sums[nearestIndex(point, centers)];
      sum[0] += point[0];
      sum[1] += point[1];
      sum[2] += point[2];
      sum[3] += 1;
    }
    centers = sums.map((sum, index) =>
      sum[3] > 0
        ? ([sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3]] as LabPoint)
        : centers[index]
    );
    counts = sums.map((sum) => sum[3]);
  }

  return centers
    .map((center, index) => ({ center, count: counts[index] }))
    .filter((cluster) => cluster.count > 0);
}

function toCandidate(cluster: Cluster): Candidate {
  const [lightness, green, blue] = cluster.center;
  const chroma = Math.sqrt(green * green + blue * blue);
  const hue =
    (((Math.atan2(blue, green) * DEGREES_PER_RADIAN) % FULL_TURN) + FULL_TURN) %
    FULL_TURN;

  return {
    chroma,
    hex: oklchToHex({ c: chroma, h: hue, l: lightness }),
    hue,
    lightness,
    weight: cluster.count * (WEIGHT_FLOOR + chroma * CHROMA_WEIGHT),
  };
}

function hueGap(a: number, b: number): number {
  return Math.abs(((a - b + FULL_TURN + HALF_TURN) % FULL_TURN) - HALF_TURN);
}

/** Two candidates the eye would call the same color. */
function tooClose(a: Candidate, b: Candidate): boolean {
  if (a.chroma < NEUTRAL_CHROMA && b.chroma < NEUTRAL_CHROMA) {
    return Math.abs(a.lightness - b.lightness) < NEUTRAL_LIGHTNESS_GAP;
  }
  return (
    hueGap(a.hue, b.hue) < SIMILAR_HUE_GAP &&
    Math.abs(a.lightness - b.lightness) < SIMILAR_LIGHTNESS_GAP
  );
}

/**
 * The dominant colors of an RGBA buffer, strongest first, as `#rrggbb`.
 *
 * Takes raw `ImageData.data` — the caller decides how the image was sampled, so
 * this stays a pure function that a test can hand a hand-built buffer.
 */
export function extractPalette(pixels: ArrayLike<number>): string[] {
  const points = samplePoints(pixels);
  if (points.length < MIN_POINTS) {
    return [];
  }

  const clusters = refine(
    points,
    seedCenters(points, Math.min(MAX_CLUSTERS, points.length))
  );
  const ranked = clusters.map(toCandidate).sort((a, b) => b.weight - a.weight);

  const picked: Candidate[] = [];
  for (const candidate of ranked) {
    if (picked.length >= MAX_EXTRACTED) {
      break;
    }
    if (!picked.some((kept) => tooClose(kept, candidate))) {
      picked.push(candidate);
    }
  }

  return picked.map((candidate) => candidate.hex);
}

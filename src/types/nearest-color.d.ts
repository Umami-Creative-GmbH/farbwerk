/**
 * `nearest-color` ships no types. This mirrors the shape its README documents
 * and the parts of the API we use.
 */
declare module "nearest-color" {
  export interface NearestColorMatch {
    distance: number;
    name: string;
    rgb: { r: number; g: number; b: number };
    value: string;
  }

  export type NearestColorMatcher = (hex: string) => NearestColorMatch | null;

  interface NearestColor {
    /** Build a matcher bound to a name → hex map. */
    from: (colors: Record<string, string>) => NearestColorMatcher;
    VERSION: string;
    (needle: string, colors: Record<string, string>): NearestColorMatch | null;
  }

  const nearestColor: NearestColor;
  export default nearestColor;
}

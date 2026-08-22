/**
 * The name each role actually goes by.
 *
 * The name field starts empty and shows the role as a placeholder, so most
 * palettes never get one typed in. Everywhere a name is displayed or exported,
 * it resolves in this order: what the user typed, else the nearest catalogue
 * name for that role's base, else the role itself as a last resort while the
 * lookup is still in flight.
 */
import { usePalette } from "@/components/palette/palette-context";
import { useColorNames } from "@/hooks/use-color-names";
import { useRoleLabels } from "@/i18n/labels";
import type { ScaleRole } from "@/lib/color/types";
import { SCALE_ROLES } from "@/lib/palette/state";

export type RoleNames = Record<ScaleRole, string | null>;

export function useRoleNames(): RoleNames {
  const roleLabels = useRoleLabels();
  const { fieldsFor } = usePalette();

  const bases = SCALE_ROLES.map((role) => fieldsFor(role)?.base).filter(
    (base): base is string => Boolean(base)
  );
  const catalogue = useColorNames(bases);

  const names = {} as RoleNames;
  for (const role of SCALE_ROLES) {
    const fields = fieldsFor(role);
    if (fields) {
      names[role] =
        fields.name.trim() || catalogue[fields.base] || roleLabels[role];
    } else {
      names[role] = null;
    }
  }
  return names;
}

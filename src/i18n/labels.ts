/**
 * Key sets that are picked at runtime, written out so the extractor sees them.
 *
 * `tolgee extract` reads string literals straight out of the source. A composed
 * key — t(`role.${role}`) — is invisible to it: the CLI warns "Dynamic key" and
 * aborts the sync, and worse, a key nothing statically references is what
 * `--remove-unused` deletes from the platform.
 *
 * So wherever a key is chosen from a value, the whole finite set lives here as
 * literals and the runtime value indexes the result. The records are typed by
 * the same unions the callers iterate, so adding a role or a harmony rule
 * fails to compile until its copy exists.
 *
 * Sets used by a single component stay in that component's file, for the same
 * reason and in the same shape.
 */
import { useTranslate } from "@tolgee/react";

import type { HarmonySetting } from "@/lib/color/harmony";
import type { LinkedRole, ScaleRole } from "@/lib/color/types";

/** What a role is called before anyone names it. */
export function useRoleLabels(): Record<ScaleRole, string> {
  const { t } = useTranslate();

  return {
    primary: t("role.primary"),
    secondary: t("role.secondary"),
    tertiary: t("role.tertiary"),
  };
}

/** The "+ add …" action, one per role that can still be added. */
export function useAddRoleLabels(): Record<LinkedRole, string> {
  const { t } = useTranslate();

  return {
    secondary: t("role.add-secondary"),
    tertiary: t("role.add-tertiary"),
  };
}

export interface HarmonyCopy {
  hint: string;
  name: string;
}

/** Name and one-line explanation for every harmony rule, plus `manual`. */
export function useHarmonyCopy(): Record<HarmonySetting, HarmonyCopy> {
  const { t } = useTranslate();

  return {
    analogous: {
      hint: t("harmony.analogous-desc"),
      name: t("harmony.analogous"),
    },
    auto: { hint: t("harmony.auto-desc"), name: t("harmony.auto") },
    complement: {
      hint: t("harmony.complement-desc"),
      name: t("harmony.complement"),
    },
    manual: { hint: t("harmony.manual-desc"), name: t("harmony.manual") },
    mono: { hint: t("harmony.mono-desc"), name: t("harmony.mono") },
    split: { hint: t("harmony.split-desc"), name: t("harmony.split") },
    square: { hint: t("harmony.square-desc"), name: t("harmony.square") },
    tetradic: {
      hint: t("harmony.tetradic-desc"),
      name: t("harmony.tetradic"),
    },
    triadic: { hint: t("harmony.triadic-desc"), name: t("harmony.triadic") },
  };
}

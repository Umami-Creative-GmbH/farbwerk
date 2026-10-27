/**
 * The color scales list at the top of the sidebar.
 *
 * One row per role, each showing its swatch, its name, what it is for, and the
 * step its base landed on. "Make primary" sits in the section header because it
 * acts on the selected role; the × sits on the row because it acts on that one.
 */
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";

import { usePalette } from "@/components/palette/palette-context";
import { useRoleNames } from "@/hooks/use-role-names";
import { useAddRoleLabels, useRoleLabels } from "@/i18n/labels";
import type { LinkedRole, ScaleRole } from "@/lib/color/types";
import { anchorStepFor, SCALE_ROLES } from "@/lib/palette/state";
import { cn } from "@/lib/utils";

import { SECTION_LABEL } from "./chrome-styles";

const HEADER_ACTION =
  "cursor-pointer border-none bg-none p-0 font-heading text-[11px] uppercase tracking-widest";

export function RoleList() {
  const { t } = useTranslate();
  const { state, dispatch, fieldsFor } = usePalette();
  const roleNames = useRoleNames();
  const roleLabels = useRoleLabels();
  const addRoleLabels = useAddRoleLabels();

  const handleSelect = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const role = event.currentTarget.dataset.role as ScaleRole;
      dispatch({ role, type: "setActive" });
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const role = event.currentTarget.dataset.role as LinkedRole;
      dispatch({ role, type: "removeRole" });
    },
    [dispatch]
  );

  const handlePromote = useCallback(() => {
    if (state.active !== "primary") {
      dispatch({ role: state.active as LinkedRole, type: "makePrimary" });
    }
  }, [dispatch, state.active]);

  const handleAdd = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const role = event.currentTarget.dataset.role as LinkedRole;
      dispatch({ role, type: "addRole" });
    },
    [dispatch]
  );

  const nextRole = SCALE_ROLES.find((role) => !state.roles[role]) as
    | LinkedRole
    | undefined;

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <span className={SECTION_LABEL}>{t("sidebar.scales")}</span>
        {state.active === "primary" ? null : (
          <button
            className={cn(HEADER_ACTION, "text-(--blue-500)")}
            onClick={handlePromote}
            type="button"
          >
            {t("role.make-primary")}
          </button>
        )}
      </div>

      <div className="grid gap-1.5">
        {SCALE_ROLES.map((role) => {
          const fields = fieldsFor(role);
          if (!fields) {
            return null;
          }
          const isActive = state.active === role;
          return (
            <div
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5"
              key={role}
            >
              <button
                aria-current={isActive}
                className={cn(
                  "font-heading grid cursor-pointer grid-cols-[16px_1fr_auto] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-[color,background-color,border-color] duration-150 ease-out",
                  isActive
                    ? "border-(--fw-active-bg) bg-(--fw-active-bg) text-(--fw-active-fg)"
                    : "border-(--border-subtle) bg-(--surface-card) text-(--text-body) hover:border-(--border-strong)"
                )}
                data-role={role}
                onClick={handleSelect}
                type="button"
              >
                <span
                  className="block size-3.5 rounded-full border"
                  style={{
                    background: fields.base,
                    borderColor: isActive
                      ? "rgba(255,255,255,.35)"
                      : "var(--border-strong)",
                  }}
                />
                <span className="grid min-w-0 gap-px">
                  <span className="truncate">
                    {roleNames[role] ?? roleLabels[role]}
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.12em] uppercase opacity-60">
                    {roleLabels[role]}
                  </span>
                </span>
                <span className="font-mono text-[13px] opacity-70">
                  {anchorStepFor(state, role)}
                </span>
              </button>

              {role === "primary" ? null : (
                <button
                  aria-label={t("role.remove")}
                  className="font-heading flex size-6.5 cursor-pointer items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface-card) text-[14px] leading-none text-(--slate-500) transition-colors duration-150 ease-out hover:border-(--pink-500) hover:text-(--pink-500)"
                  data-role={role}
                  onClick={handleRemove}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {nextRole ? (
        <button
          className={cn(
            HEADER_ACTION,
            "mt-2.5 text-(--text-muted) hover:text-(--text-heading)"
          )}
          data-role={nextRole}
          onClick={handleAdd}
          type="button"
        >
          + {addRoleLabels[nextRole]}
        </button>
      ) : null}
    </div>
  );
}

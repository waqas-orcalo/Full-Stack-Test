"use client";

import { useDispatch, useSelector } from "@store/index";
import { uiActions } from "@slices/ui";
import { getPreset } from "@theme/presets";

/** Active theme preset + a setter (persisted via redux-persist). */
export function useThemePreset() {
  const dispatch = useDispatch();
  const presetId = useSelector((s) => s.ui.themePreset);
  return {
    presetId,
    preset: getPreset(presetId),
    setPreset: (id: string) => dispatch(uiActions.setThemePreset(id)),
  };
}

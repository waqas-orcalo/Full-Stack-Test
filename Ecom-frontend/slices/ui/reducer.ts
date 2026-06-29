import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_PRESET_ID } from "@theme/presets";

export interface UiState {
  themePreset: string;
}

const initialState: UiState = { themePreset: DEFAULT_PRESET_ID };

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setThemePreset: (state, action: PayloadAction<string>) => {
      state.themePreset = action.payload;
    },
  },
});

export const uiActions = slice.actions;
export const uiReducer = slice.reducer;

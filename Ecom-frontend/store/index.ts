"use client";
import type { TypedUseSelectorHook } from "react-redux";
import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";
import { combineReducers } from "redux";
import { configureStore, type ThunkAction } from "@reduxjs/toolkit";
import type { Action } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import { baseAPI } from "@services/base-api";
import { authReducer } from "@slices/auth";

// Noop storage for SSR so redux-persist does not touch `window` on the server.
const createNoopStorage = () => ({
  getItem: (): Promise<null> => Promise.resolve(null),
  setItem: (): Promise<void> => Promise.resolve(),
  removeItem: (): Promise<void> => Promise.resolve(),
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  version: 1,
  whitelist: ["auth"],
  storage,
};

const appReducer = combineReducers({
  [baseAPI.reducerPath]: baseAPI.reducer,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, appReducer);

export const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(baseAPI.middleware),
});

export const Persistor = persistStore(Store);

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof Store.dispatch;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useDispatch = (): AppDispatch => useReduxDispatch<AppDispatch>();

import { createStore, useStore } from "zustand";
import React, { createContext } from "react";

export interface GlobalProps {
  userId: string;
  permissions: Array<string>;
}

interface GlobalState extends GlobalProps {
  updateAny?: () => void;
}

export type GlobalStore = ReturnType<typeof createGlobalStore>;

export const createGlobalStore = (initProps?: Partial<GlobalProps>) => {
  const DEFAULT_PROPS: GlobalProps = {
    userId: "",
    permissions: [],
  };
  return createStore<GlobalState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
  }));
};

export const GlobalContext = createContext<GlobalStore | null>(null);

export default function useGlobalStore<T>(
  selector: (state: GlobalState) => T,
): T {
  const store = React.useContext(GlobalContext);
  if (!store) throw new Error("Missing BearContext.Provider in the tree");
  return useStore(store, selector);
}

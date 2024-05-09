import { createContext } from 'react';
import { createStore } from 'zustand';

export interface GlobalProps {
  userId: string;
  permissions: Array<string>;
}

export interface GlobalState extends GlobalProps {
  updateAny?: () => void;
}

export type GlobalStore = ReturnType<typeof createGlobalStore>;

export const createGlobalStore = (initProps?: Partial<GlobalProps>) => {
  const DEFAULT_PROPS: GlobalProps = {
    userId: '',
    permissions: [],
  };
  return createStore<GlobalState>()(set => ({
    ...DEFAULT_PROPS,
    ...initProps,
  }));
};

export const GlobalContext = createContext<GlobalStore | null>(null);

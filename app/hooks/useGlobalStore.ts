import React from 'react';
import { useStore } from 'zustand';
import { GlobalContext, type GlobalState } from '~/context/global-store';

export default function useGlobalStore<T>(
  selector: (state: GlobalState) => T,
): T {
  const store = React.useContext(GlobalContext);
  if (!store) throw new Error('Missing BearContext.Provider in the tree');

  return useStore(store, selector);
}

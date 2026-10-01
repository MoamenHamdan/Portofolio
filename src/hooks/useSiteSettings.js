import { useSyncExternalStore } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Share one live subscription per settings document across public sections.
const stores = new Map();
function getStore(name) {
  if (!stores.has(name)) {
    let state = { data: null, loading: true, error: null };
    const listeners = new Set();
    let stop;
    let timeout;
    const publish = (next) => {
      state = next;
      listeners.forEach((listener) => listener());
    };
    const start = () => {
      timeout = setTimeout(() => publish({ data: null, loading: false, error: new Error('Connection timed out') }), 15000);
      stop = onSnapshot(doc(db, 'siteSettings', name), { includeMetadataChanges: true }, (snapshot) => {
        // Wait for the server before showing cached content that may be outdated.
        if (snapshot.metadata.fromCache) return;
        clearTimeout(timeout);
        publish({ data: snapshot.exists() ? snapshot.data() : {}, loading: false, error: null });
      }, (error) => {
        clearTimeout(timeout);
        publish({ data: null, loading: false, error });
      });
    };
    stores.set(name, {
      getSnapshot: () => state,
      subscribe(listener) {
        listeners.add(listener);
        if (listeners.size === 1) start();
        return () => {
          listeners.delete(listener);
          if (!listeners.size) {
            stop?.();
            clearTimeout(timeout);
            state = { data: null, loading: true, error: null };
          }
        };
      },
      retry() {
        stop?.();
        clearTimeout(timeout);
        publish({ data: null, loading: true, error: null });
        if (listeners.size) start();
      },
    });
  }
  return stores.get(name);
}

export function useSiteSettings(name) {
  const store = getStore(name);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { ...state, retry: store.retry };
}

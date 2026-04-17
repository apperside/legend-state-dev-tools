import type { ObservableParam } from '@legendapp/state';

export interface StateBridgeOptions {
  onSnapshot: (snapshot: unknown) => void;
}

export interface StateBridge {
  getSnapshot: () => unknown;
  setData: (newData: unknown) => void;
  destroy: () => void;
}

export function createStateBridge(
  observable$: ObservableParam<any>,
  options: StateBridgeOptions
): StateBridge {
  // Get initial snapshot
  const getSnapshot = () => {
    try {
      const raw = (observable$ as any).get();
      console.log('[LSDT] raw get() result:', raw);
      console.log('[LSDT] raw get() JSON:', JSON.stringify(raw));
      const parsed = JSON.parse(JSON.stringify(raw));
      console.log('[LSDT] parsed snapshot:', parsed);
      return parsed;
    } catch (e) {
      console.error('[LSDT] getSnapshot error:', e);
      return undefined;
    }
  };

  // Subscribe to changes using onChange
  let dispose: (() => void) | null = null;
  try {
    dispose = (observable$ as any).onChange(
      () => {
        const snapshot = getSnapshot();
        options.onSnapshot(snapshot);
      },
      { trackingType: false }
    );
  } catch {
    console.warn('[Legend State DevTools] Could not subscribe to observable changes via onChange');
  }

  return {
    getSnapshot,
    setData: (newData: unknown) => {
      try {
        (observable$ as any).set(newData);
      } catch (e) {
        console.error('[Legend State DevTools] Failed to set data:', e);
      }
    },
    destroy: () => {
      if (dispose) {
        dispose();
        dispose = null;
      }
    },
  };
}

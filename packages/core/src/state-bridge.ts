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
      return JSON.parse(JSON.stringify((observable$ as any).peek()));
    } catch {
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

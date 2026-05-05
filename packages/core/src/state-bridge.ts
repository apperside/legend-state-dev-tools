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
      // Recursively extract plain values from the observable tree.
      // We access each level via obs[key] (the child observable proxy) and call peek() on leaf nodes
      // to get the actual primitive, rather than relying on get() + JSON.stringify which can
      // fail to serialize primitive-valued observable nodes (they appear as {}).
      const extractPlainValue = (obs: any): unknown => {
        if (obs === null || obs === undefined) return obs;
        if (typeof obs !== 'object' && typeof obs !== 'function') return obs;

        const isObservable =
          typeof obs.peek === 'function' && typeof obs.onChange === 'function';

        if (isObservable) {
          const raw = obs.peek();
          if (raw === null || raw === undefined) return raw;
          if (typeof raw !== 'object') return raw; // primitive leaf
          if (Array.isArray(raw)) {
            return raw.map((_: unknown, i: number) => extractPlainValue(obs[i]));
          }
          const result: Record<string, unknown> = {};
          for (const key of Object.keys(raw)) {
            result[key] = extractPlainValue(obs[key]);
          }
          return result;
        }

        if (Array.isArray(obs)) {
          return obs.map((item: unknown) => extractPlainValue(item));
        }
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(obs)) {
          result[key] = extractPlainValue(obs[key]);
        }
        return result;
      };

      return extractPlainValue(observable$);
    } catch (e) {
      console.error('[Legend State DevTools] getSnapshot error:', e);
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

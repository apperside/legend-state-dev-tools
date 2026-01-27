import type { ObservableParam } from '@legendapp/state';
import { Toolbar } from './ui/toolbar';
import { Panel } from './ui/panel';
import { createStateBridge, type StateBridge } from './state-bridge';
import { mountJsonEditor, type JsonEditorBridge } from './ui/json-editor-mount';
import { createCleanup } from './ui/shared-utils';

export interface DevToolsOptions {
  enabled?: boolean;
  readOnly?: boolean;
  theme?: string;
  rootName?: string;
  position?: 'left' | 'right';
  defaultOpen?: boolean;
}

export interface DevTools {
  destroy: () => void;
}

export function init(
  observable$: ObservableParam<any>,
  options: DevToolsOptions = {}
): DevTools {
  const {
    enabled = true,
    readOnly = false,
    theme = 'githubDark',
    rootName = 'state$',
    position = 'right',
    defaultOpen = false,
  } = options;

  if (!enabled) {
    return { destroy: () => {} };
  }

  const cleanup = createCleanup();
  let panel: Panel | null = null;
  let toolbar: Toolbar | null = null;
  let bridge: StateBridge | null = null;
  let editorBridge: JsonEditorBridge | null = null;

  // Create panel
  panel = new Panel({
    rootName,
    readOnly,
    position,
    onClose: () => {
      hidePanel();
    },
  });

  const showPanel = () => {
    if (!panel) return;
    panel.show();
    toolbar?.setPanelVisible(true);

    // Poll for editor root element (innerHTML may not be ready immediately)
    const tryMount = (retries = 10) => {
      const editorRoot = panel?.getEditorRoot();
      if (!editorRoot) {
        if (retries > 0) {
          setTimeout(() => tryMount(retries - 1), 16);
        } else {
          console.warn('[Legend State DevTools] Could not find #lsdt-json-editor-root after retries');
        }
        return;
      }
      if (editorBridge) return;

      const initialData = bridge?.getSnapshot() ?? {};

      editorBridge = mountJsonEditor(editorRoot, {
        initialData,
        onEdit: (newData: unknown) => {
          bridge?.setData(newData);
        },
        readOnly,
        theme,
        rootName,
      });
    };
    tryMount();
  };

  const hidePanel = () => {
    if (editorBridge) {
      editorBridge.destroy();
      editorBridge = null;
    }
    panel?.hide();
    toolbar?.setPanelVisible(false);
  };

  const togglePanel = () => {
    if (panel?.isVisible()) {
      hidePanel();
    } else {
      showPanel();
    }
  };

  // Create toolbar
  toolbar = new Toolbar({
    onTogglePanel: togglePanel,
    rootName,
  });
  toolbar.mount();
  cleanup.add(() => toolbar?.unmount());

  // Create state bridge
  bridge = createStateBridge(observable$, {
    onSnapshot: (snapshot) => {
      if (panel?.getIsDragging()) return;
      editorBridge?.updateData(snapshot);
    },
  });
  cleanup.add(() => bridge?.destroy());
  cleanup.add(() => {
    if (editorBridge) {
      editorBridge.destroy();
      editorBridge = null;
    }
  });
  cleanup.add(() => panel?.unmount());

  if (defaultOpen) {
    showPanel();
  }

  return {
    destroy: () => {
      cleanup.run();
    },
  };
}

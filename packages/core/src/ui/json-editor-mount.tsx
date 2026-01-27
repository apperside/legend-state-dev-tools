import React, { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { JsonEditor, githubDarkTheme, githubLightTheme, monoDarkTheme, monoLightTheme } from 'json-edit-react';

const themeMap: Record<string, object> = {
  githubDark: githubDarkTheme,
  githubLight: githubLightTheme,
  monoDark: monoDarkTheme,
  monoLight: monoLightTheme,
};

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Legend State DevTools] React error:', error, info);
  }
  render() {
    if (this.state.error) {
      return React.createElement(
        'pre',
        { style: { color: '#ff6b6b', padding: 16, fontSize: 12 } },
        `DevTools Error: ${this.state.error.message}\n${this.state.error.stack}`
      );
    }
    return this.props.children;
  }
}

interface JsonEditorWrapperProps {
  data: unknown;
  onEdit: (newData: unknown) => void;
  readOnly: boolean;
  theme: string;
  rootName: string;
}

function JsonEditorWrapper({
  data,
  onEdit,
  readOnly,
  theme,
  rootName,
}: JsonEditorWrapperProps) {
  const resolvedTheme = themeMap[theme] ?? githubDarkTheme;
  return (
    <JsonEditor
      data={data as Record<string, unknown>}
      setData={onEdit as any}
      rootName={rootName}
      theme={resolvedTheme as any}
      collapse={2}
      restrictEdit={readOnly}
      restrictDelete={readOnly}
      restrictAdd={readOnly}
      restrictTypeSelection={readOnly ? true : undefined}
    />
  );
}

export interface JsonEditorBridge {
  updateData: (data: unknown) => void;
  destroy: () => void;
}

// Wrapper component that receives data via a callback registration
function JsonEditorBridgeWrapper(props: {
  initialData: unknown;
  onEdit: (newData: unknown) => void;
  readOnly: boolean;
  theme: string;
  rootName: string;
  registerUpdater: (updater: (data: unknown) => void) => void;
}) {
  const [data, setData] = useState<unknown>(props.initialData);

  useEffect(() => {
    props.registerUpdater((newData: unknown) => {
      setData(newData);
    });
  }, []);

  const handleEdit = (newData: unknown) => {
    setData(newData);
    props.onEdit(newData);
  };

  return (
    <JsonEditorWrapper
      data={data}
      onEdit={handleEdit}
      readOnly={props.readOnly}
      theme={props.theme}
      rootName={props.rootName}
    />
  );
}

export function mountJsonEditor(
  container: HTMLElement,
  options: {
    initialData: unknown;
    onEdit: (newData: unknown) => void;
    readOnly: boolean;
    theme: string;
    rootName: string;
  }
): JsonEditorBridge {
  let root: Root | null = null;
  let updaterFn: ((data: unknown) => void) | null = null;

  root = createRoot(container);
  root.render(
    <ErrorBoundary>
    <JsonEditorBridgeWrapper
      initialData={options.initialData}
      onEdit={options.onEdit}
      readOnly={options.readOnly}
      theme={options.theme}
      rootName={options.rootName}
      registerUpdater={(updater) => {
        updaterFn = updater;
      }}
    />
    </ErrorBoundary>
  );

  return {
    updateData: (data: unknown) => {
      updaterFn?.(data);
    },
    destroy: () => {
      if (root) {
        root.unmount();
        root = null;
      }
    },
  };
}

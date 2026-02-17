import React, { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { JsonEditor, githubDarkTheme, githubLightTheme, monoDarkTheme, monoLightTheme, type NodeData, type JsonEditorProps } from 'json-edit-react';
import { downloadJson, buildDumpFilename } from './dump-utils';

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

type CustomButtonDefinition = NonNullable<JsonEditorProps['customButtons']>[number];

function DumpNodeButton() {
  return (
    <svg
      className="lsdt-node-dump-btn"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
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

  const dumpNodeButton: CustomButtonDefinition = {
    Element: DumpNodeButton,
    onClick: (nodeData: NodeData) => {
      const pathParts = nodeData.path.map(String);
      downloadJson(nodeData.value, buildDumpFilename(rootName, pathParts));
    },
  };

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
      customButtons={[dumpNodeButton]}
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

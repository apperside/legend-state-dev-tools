import React from 'react';
import { createRoot } from 'react-dom/client';
import { init } from 'legend-state-dev-tools';
import 'legend-state-dev-tools/dist/styles.css';
import { state$ } from './state';
import { App } from './App';

// Initialize dev tools
init(state$, {
  rootName: 'state$',
  theme: 'githubDark',
  readOnly: false,
  defaultOpen: true,
});

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

/**
 * Eta template engine wrapper for Legend State Dev Tools
 */
import { Eta } from 'eta';

import toolbarTemplate from './templates/toolbar.eta';
import panelTemplate from './templates/panel.eta';

const eta = new Eta({
  autoEscape: true,
  autoTrim: false,
});

const templates: Record<string, string> = {
  toolbar: toolbarTemplate,
  panel: panelTemplate,
};

export function renderTemplate<T extends Record<string, unknown>>(
  name: string,
  data: T
): string {
  const template = templates[name];
  if (!template) {
    console.error(`[LSDT] Template not found: ${name}`);
    return '';
  }
  try {
    return eta.renderString(template, data);
  } catch (error) {
    console.error(`[LSDT] Error rendering template ${name}:`, error);
    return '';
  }
}

export interface ToolbarData {
  [key: string]: unknown;
  isMinimized: boolean;
  panelVisible: boolean;
  rootName: string;
}

export function renderToolbar(data: ToolbarData): string {
  return renderTemplate('toolbar', data);
}

export interface PanelData {
  [key: string]: unknown;
  rootName: string;
  readOnly: boolean;
}

export function renderPanel(data: PanelData): string {
  return renderTemplate('panel', data);
}

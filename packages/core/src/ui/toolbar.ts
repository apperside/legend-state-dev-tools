import { renderToolbar, type ToolbarData } from './template-engine';
import { getStoredBoolean, setStoredBoolean } from './shared-utils';

export class Toolbar {
  private container: HTMLElement | null = null;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private isMinimized: boolean = getStoredBoolean('toolbar-minimized', false);
  private panelVisible = false;

  private onTogglePanel?: () => void;
  private rootName: string;

  constructor(options: { onTogglePanel?: () => void; rootName?: string } = {}) {
    this.onTogglePanel = options.onTogglePanel;
    this.rootName = options.rootName || 'state$';
  }

  public mount(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'lsdt-toolbar';
    if (this.isMinimized) {
      this.container.classList.add('lsdt-toolbar-minimized');
    }

    document.body.appendChild(this.container);
    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    if (!this.container) return;

    const data: ToolbarData = {
      isMinimized: this.isMinimized,
      panelVisible: this.panelVisible,
      rootName: this.rootName,
    };

    this.container.innerHTML = renderToolbar(data);
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    this.container.addEventListener('click', this.handleClick);
    this.container.addEventListener('mousedown', this.handleMouseDown);
  }

  private handleClick = (e: Event): void => {
    const target = e.target as HTMLElement;
    const actionElement = target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.getAttribute('data-action');
    if (action === 'toggle-panel') {
      this.onTogglePanel?.();
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') return;

    this.isDragging = true;
    if (this.container) {
      this.container.classList.add('dragging');
      const rect = this.container.getBoundingClientRect();
      this.offsetX = e.clientX - rect.left;
      this.offsetY = e.clientY - rect.top;
    }
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging || !this.container) return;

    this.container.style.left = `${e.clientX - this.offsetX}px`;
    this.container.style.top = `${e.clientY - this.offsetY}px`;
    this.container.style.right = 'auto';
    this.container.style.bottom = 'auto';
  };

  private handleMouseUp = (): void => {
    this.isDragging = false;
    this.container?.classList.remove('dragging');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  public setPanelVisible(visible: boolean): void {
    this.panelVisible = visible;
    this.render();
  }

  public unmount(): void {
    if (this.container) {
      this.container.removeEventListener('click', this.handleClick);
      this.container.removeEventListener('mousedown', this.handleMouseDown);
      this.container.remove();
      this.container = null;
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}

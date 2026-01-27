import { renderPanel, type PanelData } from './template-engine';
import { getStoredString, setStoredString } from './shared-utils';

export class Panel {
  private container: HTMLElement | null = null;
  private visible = false;
  private rootName: string;
  private readOnly: boolean;
  private onClose?: () => void;
  private position: 'left' | 'right';
  private resizeHandle: HTMLElement | null = null;
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  constructor(options: {
    rootName?: string;
    readOnly?: boolean;
    onClose?: () => void;
    position?: 'left' | 'right';
  } = {}) {
    this.rootName = options.rootName || 'state$';
    this.readOnly = options.readOnly || false;
    this.onClose = options.onClose;
    this.position = options.position || 'right';
  }

  public toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public show(): void {
    this.visible = true;

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'lsdt-panel';
      if (this.position === 'left') {
        this.container.classList.add('lsdt-panel-left');
      }

      const savedWidth = getStoredString('panel-width', '');
      if (savedWidth) {
        this.container.style.width = savedWidth;
      }

      this.restoreSavedPosition();

      this.resizeHandle = document.createElement('div');
      this.resizeHandle.className = 'lsdt-resize-handle';
      this.attachResizeListeners(this.resizeHandle);

      document.body.appendChild(this.container);
      this.attachEventListeners();
    }

    this.render();
  }

  public hide(): void {
    this.visible = false;
    this.cleanupListeners();
    this.container?.remove();
    this.container = null;
    this.resizeHandle = null;
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public getEditorRoot(): HTMLElement | null {
    return this.container?.querySelector('#lsdt-json-editor-root') || null;
  }

  private render(): void {
    if (!this.container) return;

    const data: PanelData = {
      rootName: this.rootName,
      readOnly: this.readOnly,
    };

    this.container.innerHTML = renderPanel(data);

    if (this.resizeHandle) {
      this.container.appendChild(this.resizeHandle);
    }

    this.attachDragListeners();
  }

  private attachEventListeners(): void {
    if (!this.container) return;
    this.container.addEventListener('click', this.handleClick);
  }

  private handleClick = (e: Event): void => {
    const target = e.target as HTMLElement;
    const actionElement = target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.getAttribute('data-action');
    if (action === 'close-panel') {
      this.onClose?.();
    }
  };

  private attachResizeListeners(handle: HTMLElement): void {
    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      const panel = this.container;
      if (!panel) return;

      const startX = e.clientX;
      const startWidth = panel.getBoundingClientRect().width;
      const isLeft = this.position === 'left';

      panel.classList.add('lsdt-resizing');

      const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        // Dragging left edge leftward (right-positioned) increases width; right edge rightward (left-positioned) increases width
        const newWidth = isLeft ? startWidth + delta : startWidth - delta;
        const clamped = Math.max(280, Math.min(newWidth, window.innerWidth * 0.9));
        panel.style.width = `${clamped}px`;
      };

      const onMouseUp = () => {
        panel.classList.remove('lsdt-resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setStoredString('panel-width', panel.style.width);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  private restoreSavedPosition(): void {
    if (!this.container) return;
    const saved = getStoredString('panel-position', '');
    if (saved) {
      try {
        const pos = JSON.parse(saved);
        this.container.style.top = pos.top;
        this.container.style.left = pos.left;
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
      } catch {
        // ignore invalid stored position
      }
    }
  }

  private attachDragListeners(): void {
    if (!this.container) return;
    const header = this.container.querySelector('.lsdt-panel-header') as HTMLElement | null;
    if (!header) return;

    header.addEventListener('mousedown', this.handleDragStart);
  }

  private handleDragStart = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-action]')) return;

    e.preventDefault();
    if (!this.container) return;

    this.isDragging = true;
    const rect = this.container.getBoundingClientRect();
    this.dragOffsetX = e.clientX - rect.left;
    this.dragOffsetY = e.clientY - rect.top;

    this.container.classList.add('lsdt-dragging');
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
  };

  private handleDragMove = (e: MouseEvent): void => {
    if (!this.isDragging || !this.container) return;

    const left = e.clientX - this.dragOffsetX;
    const top = e.clientY - this.dragOffsetY;

    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;
    this.container.style.right = 'auto';
    this.container.style.bottom = 'auto';
  };

  private handleDragEnd = (): void => {
    if (!this.isDragging || !this.container) return;

    this.isDragging = false;
    this.container.classList.remove('lsdt-dragging');
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);

    setStoredString('panel-position', JSON.stringify({
      top: this.container.style.top,
      left: this.container.style.left,
    }));
  };

  private cleanupListeners(): void {
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
  }

  public unmount(): void {
    if (this.container) {
      this.cleanupListeners();
      this.container.removeEventListener('click', this.handleClick);
      this.container.remove();
      this.container = null;
      this.resizeHandle = null;
    }
    this.visible = false;
  }
}

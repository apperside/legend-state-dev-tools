import { renderPanel, type PanelData } from './template-engine';

export class Panel {
  private container: HTMLElement | null = null;
  private visible = false;
  private rootName: string;
  private readOnly: boolean;
  private onClose?: () => void;
  private position: 'left' | 'right';

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
      document.body.appendChild(this.container);
      this.attachEventListeners();
    }

    this.render();
  }

  public hide(): void {
    this.visible = false;
    this.container?.remove();
    this.container = null;
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

  public unmount(): void {
    if (this.container) {
      this.container.removeEventListener('click', this.handleClick);
      this.container.remove();
      this.container = null;
    }
    this.visible = false;
  }
}

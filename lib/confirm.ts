export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions use a red confirm button. */
  tone?: "default" | "danger";
};

type ConfirmHandler = (options: ConfirmOptions) => Promise<boolean>;

let confirmHandler: ConfirmHandler | null = null;

export function registerConfirmHandler(handler: ConfirmHandler | null): void {
  confirmHandler = handler;
}

/** Promise-based confirm dialog (replaces window.confirm). */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  if (confirmHandler) {
    return confirmHandler(options);
  }
  return Promise.resolve(window.confirm(options.message));
}

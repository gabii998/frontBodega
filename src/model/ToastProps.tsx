export default interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: (() => void) | null;
  duration?: number | null;
}

export const successToast = (message:string): ToastProps => (
  {
    type: 'success',
    message: message
  }
);

export const errorToast = (message:string): ToastProps => (
  {
    type: 'error',
    message: message
  }
);
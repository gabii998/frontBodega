export default interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: (() => void ) | null;
  duration?: number | null;
}
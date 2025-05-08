import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import ToastProps from '../model/ToastProps';

const Toast: React.FC<ToastProps> = ({ type, message, onClose = () => {}, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if(onClose) {
        onClose();
      }
    }, duration ?? 3000);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-500 text-green-700';
      case 'error': return 'bg-red-100 border-red-500 text-red-700';
      case 'info': return 'bg-blue-100 border-blue-500 text-blue-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      case 'info': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border ${getBgColor()} shadow-md flex items-center z-50 animate-fade-in-down`}>
      <div className="mr-2">
        {getIcon()}
      </div>
      <div className="flex-1">
        {message}
      </div>
      <button onClick={() => {
        if(onClose) {
          onClose()
        }
      }} className="ml-4">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
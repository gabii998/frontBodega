import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
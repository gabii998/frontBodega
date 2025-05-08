import Farm from './Farm';

export default interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (farm: Farm) => void;
  farm?: Farm;
  isLoading?: boolean;
}
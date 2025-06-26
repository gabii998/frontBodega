import {Employee} from "./Employee";
import {Quarter} from "./Quarter";
import Variety from "./Variety";

export default interface QuarterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quarter: Quarter) => void;
    quarter?: Quarter;
    isLoading?: boolean;
    setAvailableVarieties:(varieties:Variety[]) => void,
    availableVarieties: Variety[];
    availableEmployees: Employee[];
    activeFarmId: number;
}
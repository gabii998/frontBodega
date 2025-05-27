import IndicadoresDto from "./IndicadoresDto";

export default interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (summary: IndicadoresDto) => void;
    summary: IndicadoresDto;
  }
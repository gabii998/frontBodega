import GeneralSummary from "./GeneralSummary";

export default interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (summary: GeneralSummary) => void;
    summary: GeneralSummary;
  }
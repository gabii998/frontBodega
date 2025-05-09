import Task from "./Task";

export default interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id'>) => void;
    task?: Task;
    isLoading?: boolean;
  }
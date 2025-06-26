import { Employee } from "./Employee";
import Task from "./Task";
import Workday from "./Workday";

export default interface StructureWorkdayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workday: Workday) => void;
    workday?: Workday | null;
    employees: Employee[];
    tasks: Task[];
}
import { Employee } from "./Employee";
import Task from "./Task";
import VarietyCuartel from "./VarietyCuartel";
import Workday from "./Workday";

export default interface WorkdayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workday: Workday) => void;
    workday?: Workday | null;
    employees: Employee[];
    tasks: Task[];
    quarterName: string;
    quarterId:number;
    varieties?: VarietyCuartel[];
  }
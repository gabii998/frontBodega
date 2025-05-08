import Employee from "./Employee";

export default interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Employee) => Promise<void>; // Cambiado a Promise
    employee?: Employee;
    isLoading?: boolean;
  }
import TaskSummary from "./TaskSummary";

export default interface CategorySummary {
    totalHours: number | null;
    workdaysPerHectare: number | null;
    tasks: TaskSummary[];
  }
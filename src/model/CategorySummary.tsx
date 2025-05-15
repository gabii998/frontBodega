import TaskSummary from "./TaskSummary";

export default interface CategorySummary {
    totalHours: number | null;
    jornales:number;
    workdaysPerHectare: number | null;
    tasks: TaskSummary[];
  }
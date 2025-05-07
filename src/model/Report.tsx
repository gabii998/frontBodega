import Quarter from "./Quarter";

export default interface Report {
  id: number;
  quarter: Quarter;
  date: string;
  totalHours: number;
  totalWorkdays: number;
  manualWorkdays: number;
  mechanicalWorkdays: number;
  performance: number;
  variedadId?: number;
  variedadNombre?: string;
  esVariedad?: boolean;
  superficie?: number; // Superficie específica de la variedad (cuando es un reporte de variedad)
}
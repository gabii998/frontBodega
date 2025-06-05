import TareaJornal from "./TareaJornal";

export default interface DetalleVariedad {
  idVariedad: number;
  nombreVariedad: string;
  superficie: number;
  hileras:number;
  jornalesTotales: number | undefined;
  jornalesManuales: number;
  jornalesMecanicos: number;
  rendimiento: number;
  tareasManuales: TareaJornal[];
  tareasMecanicas: TareaJornal[];
}
import VariedadReporte from "./VariedadReporte";

export default interface ReporteCuartel {
  id:number;
  cuartelId: number;
  cuartelNombre: string;
  superficie: number;
  hileras:number;
  fecha: string;
  jornalesTotales: number;
  rendimiento: number;
  esVariedad:boolean;
  variedades: VariedadReporte[];
}
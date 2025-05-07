import VariedadReporte from "./VariedadReporte";

export default interface ReporteCuartel {
  cuartelId: number;
  cuartelNombre: string;
  superficie: number;
  fecha: string;
  jornalesTotales: number;
  rendimiento: number;
  variedades: VariedadReporte[];
}
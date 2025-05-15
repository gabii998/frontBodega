export default interface ReporteVista {
  id: number; // ID único para la lista
  cuartelId: number;
  cuartelNombre: string;
  fecha: string;
  totalHoras: number; // jornalesTotales convertido a horas
  totalJornales: number; // jornalesTotales
  rendimiento: number;
  superficie: number;
  hileras:number;
  variedadId?: number; // Opcional para reportes generales de cuartel
  variedadNombre?: string; // Opcional para reportes generales de cuartel
  esVariedad: boolean; // Indica si este elemento es una variedad específica
}
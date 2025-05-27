export interface ReporteResponse {
  id:number,
  nombre:string,
  anio:string,
  superficie:number,
  hileras:number,
  jornales:number,
  rendimiento:number,
  esVariedad:boolean,
  cuartel:CuartelReporte | null,
  reporteVariedades:ReporteResponse[]
}

export interface CuartelReporte {
  id:number,
  nombre:string
}
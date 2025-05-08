export default interface Workday {
    id?: number;
    fecha: string;
    jornales: number;
    empleadoId: number;
    empleadoNombre: string;
    tareaId: number;
    tareaNombre: string;
    variedadId?: number;
    variedadNombre?: string;
    cuartelId:number
}
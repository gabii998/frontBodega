export interface Workday {
    id?: number;
    fecha: string;
    jornales: number;
    empleadoId: number;
    empleadoNombre: string;
    tareaId: number;
    tareaNombre: string;
    variedadId?: number;
    variedadNombre?: string;
    cuartelId:number;
    esEstructuraGeneral:boolean;
}

export const defaultWorkday = ():Workday => (
    {
    fecha: new Date().toISOString().split('T')[0],
    jornales: 0,
    empleadoId: 0,
    empleadoNombre: '',
    tareaId: 0,
    tareaNombre: '',
    variedadId: undefined,
    variedadNombre: undefined,
    cuartelId: 0,
    esEstructuraGeneral:false
  }
);
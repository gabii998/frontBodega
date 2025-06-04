import VarietyCuartel from "./VarietyCuartel";

export interface Quarter {
    id?: number;
    nombre: string;
    variedades: VarietyCuartel[];
    encargadoId?: number | null;
    fincaId?:number | null;
    encargadoNombre?: string | null;
    superficieTotal?: number;
    hileras?:number;
    sistema?: 'Parral' | 'Espaldero' | null;
  }

  export const createQuarterBase = (): Quarter => ({
    nombre: '',
    variedades: [],
    encargadoId: null,
    encargadoNombre: null,
    fincaId:-1,
    superficieTotal: 0,
    sistema: 'Parral',
    hileras:0
  });
  
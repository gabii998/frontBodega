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
    sistema?: 'parral' | 'espaldero' | null;
  }

  export const createQuarterBase = (): Quarter => ({
    nombre: '',
    variedades: [],
    encargadoId: null,
    encargadoNombre: null,
    superficieTotal: 0,
    sistema: 'parral',
    hileras:0
  });
  
import VarietyCuartel from "./VarietyCuartel";

export interface Quarter {
    id?: number;
    nombre: string;
    variedades: VarietyCuartel[];
    managerId?: number | null;
    encargadoNombre?: string | null;
    superficieTotal: number;
    sistema?: 'parral' | 'espaldero' | null;
  }

  export const createQuarterBase = (): Quarter => ({
    nombre: '',
    variedades: [],
    managerId: null,
    encargadoNombre: null,
    superficieTotal: 0,
    sistema: 'parral',
  });
  
import VarietyCuartel from "./VarietyCuartel";

export default interface Quarter {
    id?: number;
    nombre: string;
    variedades: VarietyCuartel[];
    managerId?: number | null;
    encargadoNombre?: string | null;
    superficieTotal: number;
    sistema?: 'parral' | 'espaldero' | null;
  }
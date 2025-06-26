export interface Employee {
    id?: number;
    nombre: string;
    dni: string;
    fincaId?:number | null;
}

export const createEmployee = (): Employee => ({
    nombre: '',
    dni: ''
})
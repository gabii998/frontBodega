export interface Employee {
    id?: number;
    nombre: string;
    dni: string;
}

export const createEmployee = (): Employee => ({
    nombre: '',
    dni: ''
})
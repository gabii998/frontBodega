export default interface JornalNoProductivo {
    nombreEmpleado:string,
    idEmpleado?:number|null;
    jornales:number;
    fecha:string;
    id?:number|null;
}

export const defaultJornalNp = (): JornalNoProductivo => ({
    nombreEmpleado:'',
    idEmpleado:null,
    jornales:0,
    fecha: new Date().toISOString().split('T')[0],
    id:null
})
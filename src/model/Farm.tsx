export default interface Farm {
    id: number;
    nombre: string;
}

  export const defaultFarm = (): Farm => ({
    id: 0,
    nombre: ''
  });
  
export default interface IndicadoresDto {
  estructura: number;
  totalProductivo: number;
  jornalesNoProductivos: number;
  jornalesPagados: number;
  rendimiento: number;
  quintalPorJornal: number;
}

export const createIndicadores = (): IndicadoresDto => ({
  estructura: 0,
  totalProductivo: 0,
  jornalesNoProductivos: 0,
  jornalesPagados: 0,
  rendimiento: 0,
  quintalPorJornal: 0
});

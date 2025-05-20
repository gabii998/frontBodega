import axios from 'axios';
import ReporteCuartel from '../model/ReporteCuartel';
import IndicadoresDto from '../model/IndicadoresDto';
import DetalleVariedad from '../model/DetalleVariedad';
import Report from '../model/Report';

export const reportService = {
  async getByYear(year: number, fincaId: number): Promise<ReporteCuartel[]> {
    const response = await axios.get<ReporteCuartel[]>(
      `/api/reportes/anio/${year}/finca/${fincaId}`
    );
    return response.data;
  },

  async getIndicadores(year: string, cuartelId: number, variedadId?: number): Promise<IndicadoresDto> {
    const endpoint = variedadId
      ? `/api/reportes/anio/${year}/cuartel/${cuartelId}/variedad/${variedadId}/indicadores`
      : `/api/reportes/anio/${year}/cuartel/${cuartelId}/indicadores`;
    
    const response = await axios.get<IndicadoresDto>(endpoint);
    return response.data;
  },

  async updateIndicadores(
    report:Report,
    indicadores: IndicadoresDto,
  ): Promise<IndicadoresDto> {
    const endpoint = report.variedadId
      ? `/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/variedad/${report.variedadId}/indicadores`
      : `/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/indicadores`;
    
    const response = await axios.put<IndicadoresDto>(endpoint, indicadores);
    return response.data;
  },

  async getVariedadDetalle(
    year: string, 
    cuartelId: number, 
    variedadId: number
  ): Promise<DetalleVariedad> {
    const response = await axios.get<DetalleVariedad>(
      `/api/reportes/anio/${year}/cuartel/${cuartelId}/variedad/${variedadId}/detalle`
    );
    return response.data;
  }
};
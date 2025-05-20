import IndicadoresDto from "./IndicadoresDto";

export default interface SummaryFields {
     key: keyof IndicadoresDto; 
     label: string; 
     suffix: string 
}
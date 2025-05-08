import GeneralSummary from "./GeneralSummary";

export default interface SummaryFields {
     key: keyof GeneralSummary; 
     label: string; 
     suffix: string 
}
import { Plate } from "../../model/Plate";
import { SuperCarValuation } from "../../model/Valuation";

export type SuperCarValuationResponse = {
  vin: string;
  registrationDate: string;
  plate: Plate;
  valuation: SuperCarValuation;
};

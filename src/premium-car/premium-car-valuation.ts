import { VehicleValuation } from '@app/models/vehicle-valuation';
import { ValuationProvider } from '@app/routes/valuation/interfaces/ValuationProvider';
import { PremiumCarValuationResponse } from './types/premium-car-response';
import axios from 'axios';

export class PremiumCarValuationProvider implements ValuationProvider {
  async getValuation(vrm: string, mileage: number): Promise<VehicleValuation> {
    return this.fetchValuationFromPremiumCarValuation(vrm, mileage);
  }

  async fetchValuationFromPremiumCarValuation(
    vrm: string,
    mileage: number,
  ): Promise<VehicleValuation> {
    axios.defaults.baseURL =
      'https://run.mocky.io/v3/9245229e-5c57-44e1-964b-36c7fb29168b';
    const response = await axios.get<PremiumCarValuationResponse>(
      `valuations/${vrm}?mileage=${mileage}`,
    );

    const valuation = new VehicleValuation();

    valuation.vrm = vrm;
    valuation.lowestValue = response.data.valuationPrivateSaleMinimum;
    valuation.highestValue = response.data.valuationPrivateSaleMaximum;

    return valuation;
  }
}

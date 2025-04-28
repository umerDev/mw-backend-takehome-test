import { ValuationProvider } from '@app/routes/valuation/interfaces/ValuationProvider';
import { VehicleValuation } from '@app/models/vehicle-valuation';

export class FailoverValuationProvider implements ValuationProvider {
  private readonly superCarValuationProvider: ValuationProvider;
  private readonly premiumCarValuationProvider: ValuationProvider;

  private successCount = 0;
  private failuerCount = 0;
  private failoverActive = false;
  private failoverTimeout: NodeJS.Timeout | null = null;

  constructor(
    superCarValuationProvider: ValuationProvider,
    premiumCarValuationProvider: ValuationProvider,
  ) {
    this.superCarValuationProvider = superCarValuationProvider;
    this.premiumCarValuationProvider = premiumCarValuationProvider;
  }

  async getValuation(vrm: string, mileage: number): Promise<VehicleValuation> {
    if (this.failoverActive) {
      return this.premiumCarValuationProvider.getValuation(vrm, mileage);
    }

    try {
      const valuation = await this.superCarValuationProvider.getValuation(
        vrm,
        mileage,
      );
      this.successCount++;
      return valuation;
    } catch (error) {
      this.failuerCount++;
      this.failoverActive = true;
      this.failoverTimeout = setTimeout(() => {
        this.failoverActive = false;
        this.failoverTimeout = null;
      }, 30000);
      return this.premiumCarValuationProvider.getValuation(vrm, mileage);
    }
  }
}

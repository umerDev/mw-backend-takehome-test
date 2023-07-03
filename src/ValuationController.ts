import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { VehicleValuationService } from './service/VehicleValuationService';
import { VehicleValuation } from './model/VehicleValuation';
import { VehicleValuationRequest } from './model/VehicleValuationRequest';

@Controller('valuations')
export class ValuationController {
  constructor(private readonly valuationService: VehicleValuationService) {
  } 

  @Put(':vrm')  
  async createValuation(
    @Param('vrm') vrm: string,
    @Body() request: VehicleValuationRequest): Promise<VehicleValuation> {

    return this.valuationService.createValuation(vrm, request.mileage);
  }

  @Get(':vrm')
  async getValuation(
    @Param('vrm') vrm: string): Promise<VehicleValuation> {
    return this.valuationService.getValuation(vrm);
  }
}
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ValuationController } from './ValuationController';
import { VehicleValuation } from './model/VehicleValuation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleValuationService } from './service/VehicleValuationService';
const path = require('path');

let ENV = process.env.NODE_ENV;

@Module({
  imports: [  
    ConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), 'env', !ENV ? '.env':  `.env.${ENV}`),
      load: [() => {
        ENV = process.env.NODE_ENV;
        return {
          ENV,
        };
      }],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH,
      synchronize: process.env.SYNC_DATABASE === 'true',
      entities: [VehicleValuation],
    }),
    TypeOrmModule.forFeature([VehicleValuation]),
  ],
  controllers: [ValuationController],
  providers: [VehicleValuationService],
})
export class AppModule {}

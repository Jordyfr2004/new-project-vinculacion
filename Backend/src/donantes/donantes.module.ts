import { Module } from '@nestjs/common';
import { DonantesController } from './controllers/donador/donantes.controller';
import {  DonadorService} from './services/donador/donador.service';
import { DonacionService } from './services/donacion/donacion.service';
import { DonacionController } from './controllers/donacion/donacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonacionModel } from './domain/models/donacion.model/donacion.model';
import { Donador } from './domain/models/donador/donador';

@Module({
  imports:[TypeOrmModule.forFeature([
    DonacionModel,Donador

  ])],
  controllers: [DonantesController, DonacionController],
  providers: [DonadorService, DonacionService]
})
export class DonantesModule {}

import { Module } from '@nestjs/common';
import { DonantesController } from './controllers/donador/donantes.controller';
import {  DonadorService} from './services/donador/donador.service';
import { DonacionService } from './services/donacion/donacion.service';
import { DonacionController } from './controllers/donacion/donacion.controller';

@Module({
  controllers: [DonantesController, DonacionController],
  providers: [DonadorService, DonacionService]
})
export class DonantesModule {}

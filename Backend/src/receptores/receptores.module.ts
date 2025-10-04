import { Module } from '@nestjs/common';
import { ReceptorController } from './controllers/receptor/receptor.controller';
import { SolicitudService } from './services/solicitud/solicitud.service';
import { ReceptoresService } from './services/receptores/receptores.service';
import { SolicitudController } from './controllers/solicitud/solicitud.controller';


@Module({
  providers: [SolicitudService, ReceptoresService],
  controllers: [ReceptorController, SolicitudController]
})
export class ReceptoresModule {}

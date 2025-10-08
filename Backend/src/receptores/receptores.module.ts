import { Module } from '@nestjs/common';
import { ReceptorController } from './controllers/receptor/receptor.controller';
import { SolicitudService } from './services/solicitud/solicitud.service';
import { ReceptoresService } from './services/receptores/receptores.service';
import { SolicitudController } from './controllers/solicitud/solicitud.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receptor } from './domain/models/receptor/receptor';
import { SolicitudModel } from './domain/models/solicitud.model/solicitud.model';
import { SolicitudRepository } from './infrastructure/repositories/solicitud.repository/solicitud.repository';
import { ReceptorRepository } from './infrastructure/repositories/receptor.repository/receptor.repository';


@Module({
  imports: [TypeOrmModule.forFeature([
    Receptor,SolicitudModel
  ])],
  providers: [SolicitudService, ReceptoresService, SolicitudRepository,ReceptorRepository],
  controllers: [ReceptorController, SolicitudController],
  exports: [ReceptoresService, SolicitudRepository],
})
export class ReceptoresModule {}

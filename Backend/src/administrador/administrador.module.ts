import { Module } from '@nestjs/common';
import { AdministradorService } from './services/administrador/administrador.service';
import { AdministradorController } from './controllers/administrador/administrador.controller';

@Module({
  providers: [AdministradorService],
  controllers: [AdministradorController]
})
export class AdministradorModule {}

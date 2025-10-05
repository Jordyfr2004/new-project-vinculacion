import { Module } from '@nestjs/common';
import { AdministradorService } from './services/administrador/administrador.service';
import { AdministradorController } from './controllers/administrador/administrador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './domain/models/administrador/administrador';
import { AdministradorRepository } from './infrastructure/repositories/administrador.repository/administrador.repository';

@Module({
  imports:[TypeOrmModule.forFeature([
    Administrador
  ])],
  providers: [AdministradorService, AdministradorRepository],
  controllers: [AdministradorController],
  exports:[AdministradorService],
})
export class AdministradorModule {}

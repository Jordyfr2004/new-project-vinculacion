import { Module } from '@nestjs/common';
import { AdministradorService } from './services/administrador/administrador.service';
import { AdministradorController } from './controllers/administrador/administrador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './domain/models/administrador/administrador';

@Module({
  imports:[TypeOrmModule.forFeature([
    Administrador
  ])],
  providers: [AdministradorService],
  controllers: [AdministradorController]
})
export class AdministradorModule {}

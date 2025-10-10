import { Module } from '@nestjs/common';
import { DonantesModule } from './donantes/donantes.module';
import { ReceptoresModule } from './receptores/receptores.module';
import { AdministradorModule } from './administrador/administrador.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    DonantesModule, ReceptoresModule, AdministradorModule],
  controllers: [ AppController],
  providers: [AppService],
})
export class AppModule {}

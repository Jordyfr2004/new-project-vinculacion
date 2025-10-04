import { Module } from '@nestjs/common';
import { DonantesModule } from './donantes/donantes.module';
import { ReceptoresModule } from './receptores/receptores.module';
import { AdministradorModule } from './administrador/administrador.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
@Module({
  imports: [DonantesModule, ReceptoresModule, AdministradorModule],
  controllers: [ AppController],
  providers: [AppService],
})
export class AppModule {}

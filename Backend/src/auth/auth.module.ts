import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AdministradorModule } from "src/administrador/administrador.module";
import { DonantesModule } from "src/donantes/donantes.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { ReceptoresModule } from "src/receptores/receptores.module";

@Module({
    imports:[
        PassportModule,
        ConfigModule,
        AdministradorModule,
        ReceptoresModule,
        DonantesModule,
        JwtModule.registerAsync({
            imports:[ConfigModule],
            useFactory: async (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET') || 'secretKey123',
                signOptions: {
                    expiresIn:'4h',}
            }),
            inject: [ConfigService],
        }),
    ],
    controllers:[AuthController],
    providers:[AuthService, JwtStrategy],
    exports:[ AuthService],
})
export class AuthModule {}
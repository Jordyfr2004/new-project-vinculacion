import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'; // 👈 ESTA IMPORTACIÓN ES LA CLAVE
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // token desde el header
      ignoreExpiration: false, // no acepta tokens expirados
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey123', // clave JWT
    });
  }

  async validate(payload: any) {
    // lo que devuelvas aquí se guarda en req.user
    return {
      id: payload.id,
      email: payload.email,
      rol: payload.rol,
    };
  }
}

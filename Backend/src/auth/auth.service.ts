import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AdministradorService } from "src/administrador/services/administrador/administrador.service";
import { verifyPassword } from "src/common/crytpto/password";
import { DonadorService } from "src/donantes/services/donador/donador.service";




@Injectable()
export class AuthService {
    constructor(
        private readonly adminService: AdministradorService,
        private readonly donanteService: DonadorService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async login( email: string, password: string, tipo: 'admin' | 'donante'){
        const pepper = this.configService.get<string>('PEPPER');
        let user: any = null;

        if(tipo === 'admin'){
            user = await this.adminService.findByEmailWithPassword(email);
        } else if(tipo === 'donante'){
            user = await this.donanteService.findByEmailWithPassword(email);
        }

        if (!user) throw new UnauthorizedException('Usuario no encontrado');

        const valid = await verifyPassword(user.password, password, pepper);
        if (!valid) throw new UnauthorizedException('contraseña incorrecta');

        const payload = {
            sub: user.id_admin || user.id_donador,
            email: user.email,
            rol: tipo,
        }

        const token = this.jwtService.sign(payload);
        return {
            message: 'Login exitoso',
            rol: tipo,
            acces_token: token
        }
    }
    

}
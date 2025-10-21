import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IAdministrador } from "src/administrador/domain/interfaces/administrador/administrador.interface";
import { AdministradorService } from "src/administrador/services/administrador/administrador.service";
import { verifyPassword } from "src/common/crytpto/password";
import { IDonador } from "src/donantes/domain/interfaces/donador/donador.interface";
import { DonadorService } from "src/donantes/services/donador/donador.service";
import { IReceptor } from "src/receptores/domain/interfaces/receptor/receptor.interface";
import { ReceptoresService } from "src/receptores/services/receptores/receptores.service";




@Injectable()
export class AuthService {
    constructor(
        private readonly adminService: AdministradorService,
        private readonly donanteService: DonadorService,
        private readonly receptorSevice: ReceptoresService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async login( email: string, password: string) {
        const pepper = this.configService.get<string>('PEPPER');

    let user: IAdministrador | IDonador | IReceptor | null = await this.adminService.findByEmailWithPassword(email);
        let rol = 'admin';

        // Si no existe en admin, buscar en donante
        if(!user){
            user = await this.donanteService.findByEmailWithPassword(email);
            rol = 'donante';
        }

         // Si no existe tampoco ahí, buscar en receptor (si lo implementas)
        if(!user){
            user = await this.receptorSevice.findByCiWithPassword(email);
            rol = 'receptor';
        }

        if(!user)  throw new UnauthorizedException('Usuario no encontrado');

        const valid = await verifyPassword((user as any).password, password, pepper);
        if (!valid) throw new UnauthorizedException('contraseña incorrecta');

        let sub: string | undefined;
        if ('id_admin' in (user as any) && (user as any).id_admin) sub = (user as any).id_admin;
        else if ('id_donante' in (user as any) && (user as any).id_donante) sub = (user as any).id_donante;
        else if ('id_receptor' in (user as any) && (user as any).id_receptor) sub = (user as any).id_receptor;

        const payload = {
            sub,
            email: (user as any).email,
            rol,
        }

        const token = this.jwtService.sign(payload);
        return {
            message: 'Login exitoso',
            rol,
            access_token: token,
        }
    }

}
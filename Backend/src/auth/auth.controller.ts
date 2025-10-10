import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    async login(
        @Body() body: { email: string, password: string, tipo: 'admin' | 'donante'},

    ) {
        return this.authService.login(body.email, body.password, body.tipo);
    }
}
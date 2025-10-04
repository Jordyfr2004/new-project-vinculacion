import { Controller, Get } from '@nestjs/common';

@Controller('donacion')
export class DonacionController {
    @Get()
    getinit(): string{
        return "Hola desde donacion";
    }
}

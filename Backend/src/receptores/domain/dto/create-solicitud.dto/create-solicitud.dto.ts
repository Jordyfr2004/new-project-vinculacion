import { IsString } from "class-validator";


export class CreateSolicitudDto {

    @IsString()
    public estado: string;

    @IsString()
    public motivo: string;
}

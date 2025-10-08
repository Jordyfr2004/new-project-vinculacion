import { IsOptional, IsString, IsUUID } from "class-validator";


export class CreateSolicitudDto {

    @IsString()
    public estado: string;

    @IsString()
    public motivo: string;

    @IsUUID()
    public id_receptor: string;

    @IsUUID()
    @IsOptional()
    public id_admin: string
}

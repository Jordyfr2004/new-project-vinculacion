import { IsOptional, IsString, IsUUID } from "class-validator";


export class CreateSolicitudDto {

    @IsOptional()
    @IsString()
    public estado: string;

    @IsString()
    public motivo: string;

    @IsOptional()
    @IsUUID()
    public id_receptor: string;

    @IsUUID()
    @IsOptional()
    public id_admin: string
}

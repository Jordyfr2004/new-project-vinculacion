import { IsString, IsUUID } from "class-validator";


export class CreateDonacionDto {
    @IsString()
    public descripcion: string;

    @IsUUID()
    public id_donante: string;
}

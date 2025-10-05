import { IsString } from "class-validator";


export class CreateDonacionDto {
    @IsString()
    public descripcion: string;
}

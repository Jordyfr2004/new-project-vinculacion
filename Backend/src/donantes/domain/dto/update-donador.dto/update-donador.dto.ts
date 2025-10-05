import { PartialType } from "@nestjs/mapped-types";
import { CreateAdministradorDto } from "src/administrador/domain/dto/create-administrador.dto/create-administrador.dto";


export class UpdateDonadorDto extends PartialType(CreateAdministradorDto) {}

import { PartialType } from "@nestjs/mapped-types";
import { CreateDonacionDto } from "../create-donacion.dto/create-donacion.dto";


export class UpdateDonacionDto extends PartialType(CreateDonacionDto) {}

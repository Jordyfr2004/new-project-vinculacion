import { PartialType } from "@nestjs/mapped-types";
import { CreateSolicitudDto } from "../create-solicitud.dto/create-solicitud.dto";


export class UpdateSolicitudDto extends PartialType(CreateSolicitudDto) {}

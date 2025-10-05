import { PartialType } from "@nestjs/mapped-types";
import { CreateReceptorDto } from "../create-receptor.dto/create-receptor.dto";


export class UpdateReceptorDto  extends PartialType(CreateReceptorDto){}

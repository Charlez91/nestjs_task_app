import { PartialType } from "@nestjs/swagger";

import { CreateTaskDto } from "./create-task.dto";
import { IsBoolean } from "class-validator";

export class UpdateTaskDto extends PartialType(CreateTaskDto){
    
    @IsBoolean()
    readonly completed?: boolean;
}
  
import { IsEnum, IsNumberString, IsString } from "class-validator";
//import { PartialType } from "@nestjs/swagger";
import {PartialType} from "@nestjs/swagger"

enum Status{
    COMPLETED="completed",
    PENDING="pending"
}

class QueryDto{
    
    @IsEnum(Status)
    readonly status?: Status;

    @IsNumberString()
    readonly page?:number;

    @IsNumberString()
    readonly limit?:number;

    @IsNumberString()
    readonly offset?:number;
}

export class TasksQueryDto extends PartialType(QueryDto){}
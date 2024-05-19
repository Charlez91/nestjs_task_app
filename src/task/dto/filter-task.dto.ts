import { IsNumberString } from "class-validator";


enum Status{
    COMPLETED="completed",
    PENDING="pending"
}

export class TasksQueryDto{
    
    status?: Status;

    @IsNumberString()
    page?:number;

    @IsNumberString()
    limit?:number;

    @IsNumberString()
    offset?:number;
}
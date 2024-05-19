import { IsNotEmpty } from "class-validator";


export class CreateTaskDto {
    @IsNotEmpty()
    readonly title: string;

    readonly description: string;
}


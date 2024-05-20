import { IsNotEmpty, IsString } from "class-validator";


export class CreateTaskDto {
    @IsNotEmpty()
    readonly title: string;

    @IsString()
    readonly description: string;
}


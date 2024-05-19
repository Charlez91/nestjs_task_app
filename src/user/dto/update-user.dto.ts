import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
    @IsEmail()
    readonly email?: string;

    @IsNotEmpty()
    readonly username?: string;
  }
  
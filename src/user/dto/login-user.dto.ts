import { IsEmail, IsNotEmpty, IsStrongPassword, IsStrongPasswordOptions } from "class-validator";

import { passwordOptions } from "./create-user.dto";

export class LoginUserDto{
    @IsEmail()
    @IsNotEmpty()
    readonly email:string;

    @IsStrongPassword(passwordOptions)
    @IsNotEmpty()
    readonly password:string;

}
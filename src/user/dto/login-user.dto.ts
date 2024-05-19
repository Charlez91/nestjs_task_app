import { IsEmail, IsNotEmpty, IsStrongPassword, IsStrongPasswordOptions } from "class-validator";

const passwordOptions: IsStrongPasswordOptions = {
    minLength:8,
    minLowercase:1,
    minUppercase:1,
    minNumbers:1,
    minSymbols:1
}

export class LoginUserDto{
    @IsEmail()
    @IsNotEmpty()
    readonly email:string;

    @IsStrongPassword(passwordOptions)
    @IsNotEmpty()
    readonly password:string;

}
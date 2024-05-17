import { Controller, Get, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { UserService } from "./user.service";

@ApiBearerAuth()
@ApiTags("User")
@Controller()
export class UserController{

    constructor(private readonly userService: UserService){}
}
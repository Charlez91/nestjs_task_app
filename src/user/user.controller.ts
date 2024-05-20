import { Body, Controller, Get, Post, Put, UsePipes } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from "./user.service";
import { User } from "./user.decorator";
import { IUserData, IUserRO } from "./user.interface";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./dto";
import { ValidationPipe } from "src/shared/pipes/validation.pipes";

//@ApiBearerAuth()
@ApiTags("User")
@Controller()
export class UserController{

    constructor(private readonly userService: UserService){}

    @ApiOperation({ summary: 'Get User' })
    @ApiResponse({ status: 200, description: 'Return User Details' })
    @ApiResponse({ status: 404, description: 'Not Found.' })
    @ApiBearerAuth()
    @Get("user")
    async getUser(@User("email") email: string):Promise<IUserRO>{
        return this.userService.findByEmail(email);
    }


    
    @ApiOperation({ summary: 'Update User Details' })
    @ApiResponse({ status: 201, description: 'User details has been successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 400, description: 'Bad Request: Username/Email exists.' })
    @ApiBearerAuth()
    @UsePipes(new ValidationPipe())
    @Put('user')
    async update(
        @User('id') userId: string, 
        @Body() userData:UpdateUserDto
    ):Promise<IUserRO>{
        /**Controller for user update */
        return this.userService.update(userId, userData)
    }

    @ApiOperation({ summary: 'Register/Create New Users' })
    @ApiResponse({ status: 201, description: 'User details has been successfully Created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @UsePipes(new ValidationPipe())
    @Post(["user", "register"])
    async create(@Body() userData:CreateUserDto):Promise<IUserRO>{
        /**controller for User creation/signup */
        console.log(userData)
        return this.userService.create(userData);
    }

    @ApiOperation({ summary: 'Login User' })
    @ApiResponse({ status: 200, description: 'User Has been logged in successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @UsePipes(new ValidationPipe())
    @Post("user/login")
    async loginUser(@Body() loginData: LoginUserDto):Promise<IUserRO>{
        /**Controller for User Login View */
        console.log(loginData)
        const foundUser = await this.userService.findOne(loginData);

        const errors = { User: 'Login Failed. User with email/password not found' };
        if (!foundUser) {
        throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);
        }
        const token = await this.userService.generateJWT(foundUser);
        const { email, username, id } = foundUser;
        const userRO:IUserData = {  email, username, token };
        return { user:userRO } as IUserRO;
    }
}
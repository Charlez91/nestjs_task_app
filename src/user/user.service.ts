import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {sign} from "jsonwebtoken";
import {createHmac} from "crypto";
//import bcrypt from "bcrypt";//eslint-disable-line
import { validate } from "class-validator";
import { ConfigService } from "@nestjs/config";

import { User, Prisma} from "@prisma/client";
import { PrismaService } from "src/prisma_service";
import { IUserRO } from "./user.interface";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./dto";

@Injectable()
export class UserService{

    constructor(
      private readonly prisma:PrismaService,
      private readonly configService:ConfigService,
    ){}

    private readonly saltRounds = 10;
    private readonly SECRET = this.configService.get<string>("SECRET_KEY");

    async findOne(loginData:LoginUserDto):Promise<User>{
      const loginOptions:LoginUserDto = {
        email:loginData.email,
        password: createHmac("sha256",this.SECRET).update(loginData.password).digest("hex")
      }
      const user = await this.prisma.user.findFirst({
        where:loginOptions
      })
      return (user)!
    }

    async findById(id:string):Promise<IUserRO>{//user in auth middleware
      const user = await this.prisma.user.findUnique({
        where:{id}
      });
      if (!user){
        let errors = {User:"Not Found"};
        throw new HttpException({errors}, HttpStatus.UNAUTHORIZED)
      };
      return this.buildUserRO(user);
    }

    async findByEmail(email:string):Promise<IUserRO>{
      const user = await this.prisma.user.findUniqueOrThrow({
        where:{email}
      });
      return this.buildUserRO(user)
    }

    async update(userId:string, userData:UpdateUserDto):Promise<IUserRO>{
      const {email, username} = userData
      const userCheck = await this.prisma.user.count({
        where:{
          OR:[
            { email},
            { username }],
          NOT:{id:userId}
        }});
        if (userCheck>0){
          throw new HttpException(
            {
              message: 'Input data validation failed',
              errors: { Data: 'Username/Email Exists. Username/Email must be unique.' },
            }, HttpStatus.BAD_REQUEST);
        };
    //TODO: Remember to check username/email entered doesnt exist

      const updatedUser = await this.prisma.user.update({
        where:{ id: userId},
        data:userData
      })
      return this.buildUserRO(updatedUser!)
    }

    async create(userData:CreateUserDto):Promise<IUserRO>{
      const {username, email, password} = userData
      console.log(userData, this.SECRET, createHmac("sha256",this.SECRET).update(password).digest("hex"))
      const hashedPassword= createHmac("sha256",this.SECRET).update(password).digest("hex")
      const userCheck = await this.prisma.user.count({
        where:{
          OR:[{ 
            email 
          },
            {
              username
            }
            ]
        }});
        if (userCheck>0){
          throw new HttpException(
            {
              message: 'Input data validation failed',
              errors: { Data: 'Username and email must be unique.' },
            }, HttpStatus.BAD_REQUEST);
        }

        const errors = await validate(userData)//might not be needed cos validation pipe should have taken care of data validation
        if (errors.length > 0) {
          throw new HttpException(
            {
              message: 'Input data validation failed',
              errors: { username: 'Userinput is not valid.' },
            },
            HttpStatus.BAD_REQUEST,
          );
        } else {
        const user = await this.prisma.user.create({
          data:{...userData, password:hashedPassword}
        });
        return this.buildUserRO(user)
      }
    }

    generateJWT(user:User):string {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 7);
        const token =  sign(
          {
            email: user.email,
            exp: exp.getTime() / 1000,
            id: user.id,
            username: user.username,
          },
          this.SECRET,
        );
        return token;
      }
    
      private buildUserRO(user: User):IUserRO {
        const userRO = {
          email: user.email,
          token: this.generateJWT(user!),
          username: user.username,
        };
    
        return { user: userRO };
    }

    /*Having issues installing bcrypt. on my new machine. Bcrypt is
    recommeneded for password hashing cos it resistant brute force attacks
    private async hashPassword(password: string): Promise<string> {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      return hashedPassword;
    }
  
    private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    }*/
}

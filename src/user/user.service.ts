import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";//eslint-disable-line

import { User, Prisma} from "@prisma/client";
import { SECRET } from "src/config";
import { PrismaService } from "src/prisma_service";
import { IUserRO } from "./user.interface";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./dto";
import { validate } from "class-validator";

@Injectable()
export class UserService{

    constructor(private readonly prisma:PrismaService){}

    private readonly saltRounds = 10;

    async findOne(loginData:LoginUserDto):Promise<User>{
      const loginOptions:LoginUserDto = {
        email:loginData.email,
        password: crypto.createHmac("sha256",SECRET).update(loginData.password).digest("hex")
      }
      const user = await this.prisma.user.findFirst({
        where:loginOptions
      })
      return (user)!
    }

    async findById(id:Prisma.UserWhereUniqueInput):Promise<IUserRO>{//user in auth middleware
      const user = await this.prisma.user.findUnique({
        where:id
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
      const user = await this.prisma.user.findUnique({
        where:{ id : userId}
      });
      if (!user){
        throw new HttpException({
          'message':'This User does not exist', 
          'errors':{User:'Not Found'}}, 
          HttpStatus.NOT_FOUND)
      };
      const updatedUser = await this.prisma.user.update({
        where:{ id: userId},
        data:userData
      })
      return this.buildUserRO(updatedUser)
    }

    async create(userData:CreateUserDto):Promise<IUserRO>{
      const {username, email, password} = userData
      const hashedPassword= crypto.createHmac("sha256",SECRET).update(password).digest("hex")
      const userCheck = await this.prisma.user.count({
        where:{
          OR:[{ 
            email 
          },{ 
            AND:{
                username
              }
            }]
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

    generateJWT(user:User) {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);
    
        return jwt.sign(
          {
            email: user.email,
            exp: exp.getTime() / 1000,
            id: user.id,
            username: user.username,
          },
          SECRET,
        );
      }
    
      private buildUserRO(user: User):IUserRO {
        const userRO = {
          email: user.email,
          token: this.generateJWT(user),
          username: user.username,
        };
    
        return { user: userRO };
    }

    private async hashPassword(password: string): Promise<string> {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      return hashedPassword;
    }
  
    private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    }
}

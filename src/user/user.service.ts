import { Injectable } from "@nestjs/common";
import jwt from "jsonwebtoken";

import { SECRET } from "src/config";
import { PrismaService } from "src/prisma_service";
import { IUserData, IUserRO } from "./user.interface";

@Injectable()
export class UserService{

    constructor(private readonly prisma:PrismaService){}

    async findall(){}

    async findOne(){}

    async findById(id:number)/*:Promise<IUserRO>*/{}

    async findByEmail(id:string)/*:Promise<IUserRO>*/{}

    async delete(id:number){}

    generateJWT(user:IUserData & {id:number}) {
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
    
      private buildUserRO(user: IUserData & {id:number}):IUserRO {
        const userRO = {
          email: user.email,
          token: this.generateJWT(user),
          username: user.username,
        };
    
        return { user: userRO };
    }
}

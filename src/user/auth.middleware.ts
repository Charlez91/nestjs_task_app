import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {verify} from 'jsonwebtoken';
import { SECRET } from '../config';
import { UserService } from './user.service';
import { IUserData } from './user.interface';
import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request & { user?: IUserData & { id?: number } }, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;
    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];
      const decoded: any = verify(token, SECRET);
      const user = await this.userService.findById(decoded.id);

      if (!user) {
        throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
      }

      req.user = user.user;
      req.user.id = decoded.id;
      next();
    } else {
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }
  }
}


// WS Auth MiddleWare to extract socket header authorization
//token
@Injectable()
export class WsAuthMiddleware implements NestMiddleware {
  constructor(
        private readonly userService:UserService
  ) {}

  async use(socket: Socket, next: (err?: any) => void) {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new UnauthorizedException('No token provided'));
    }
    //const token = (authHeaders as string).split(' ')[1];
    //console.log(token, SECRET);

    try {
      const decoded:any = verify(`${token}`, SECRET);
      const user = await this.userService.findById(decoded.id);
      socket.data.user = user.user; // Attach user data to socket
      socket.data.user.id = decoded.id
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return next(new UnauthorizedException('Invalid token'));
    }
  }
}

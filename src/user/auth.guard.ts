import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { UserService } from './user.service';
import { SECRET } from 'src/config';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const authHeaders = client.handshake.headers.authorization;
    if (!authHeaders) {
      throw new UnauthorizedException('No token provided');
    };
    const token = (authHeaders as string).split(' ')[1];

    try {
      const decoded:any = verify(token, SECRET);
      const user = await this.userService.findById(decoded.id);
      client.data.user = user.user; // Attach user data to client
      client.data.user.id = decoded.id;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

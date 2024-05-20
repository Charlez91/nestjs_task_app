import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthMiddleware, WsAuthMiddleware } from './auth.middleware';
import { PrismaService } from 'src/prisma_service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, WsAuthMiddleware],
  exports:[UserService, WsAuthMiddleware]
})
export class UserModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware)
        .forRoutes(
          { path: 'user', method: RequestMethod.GET }, 
          { path: 'user', method: RequestMethod.PUT })
    }
}

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { AuthMiddleware, WsAuthMiddleware } from '../user/auth.middleware';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma_service';
import { TaskGateway } from './task.gateway';

@Module({
  imports: [UserModule],
  controllers: [TaskController],
  providers: [TaskService, PrismaService, TaskGateway, WsAuthMiddleware],
  exports:[TaskService]
})
export class TaskModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware)
        .forRoutes(
            { path: 'tasks', method: RequestMethod.GET },
            { path: 'tasks/:id', method: RequestMethod.GET },
            { path: 'tasks/:id', method: RequestMethod.PUT },
            { path: 'tasks', method: RequestMethod.POST },
            { path: 'tasks/:id', method: RequestMethod.DELETE },
            { path: 'tasks/:title', method: RequestMethod.GET }
            //Alternative: { path: 'tasks', method: RequestMethod.ALL }
        )
    }
}

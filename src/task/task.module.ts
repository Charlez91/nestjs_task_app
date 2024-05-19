import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware)
        .forRoutes(
            { path: 'task', method: RequestMethod.GET }, 
            { path: 'task', method: RequestMethod.PUT }
        )
    }
}

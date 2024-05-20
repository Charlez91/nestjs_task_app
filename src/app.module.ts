import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { TaskGateway } from './task/task.gateway';
import { WsAuthMiddleware } from './user/auth.middleware';

@Module({
  imports: [ ConfigModule.forRoot({isGlobal:true}) , UserModule, TaskModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket, OnGatewayInit } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe, Inject, forwardRef } from '@nestjs/common';
import {Server, Socket} from "socket.io"
import { verify } from 'jsonwebtoken';

import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { WsAuthMiddleware } from 'src/user/auth.middleware';
import { ITaskRO } from './task.interface';
import { JwtAuthGuard } from 'src/user/auth.guard';


@WebSocketGateway({
  transports: ['websocket'], pingTimeout: 3000, pingInterval: 5000,
  namespace: 'ws/task',
  cors: {
    origin:["http://localhost:3001", "https://niyo.org", /\.niyo\.org$/],
    credentials:true}})
export class TaskGateway implements OnGatewayInit{

  @WebSocketServer()
  server:Server

  constructor(
    @Inject(forwardRef(() => TaskService))//used forward ref to break cyclic imports/dependecies
    private readonly taskService:TaskService,
    private readonly wsAuthMiddleware:WsAuthMiddleware
  ){}

  afterInit(server: Server) {
    server.use((socket: Socket, next) => this.wsAuthMiddleware.use(socket, next));
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({whitelist:true}))
  @SubscribeMessage('createTask')
  async handleCreateTask(
    @MessageBody() data: CreateTaskDto, 
    @ConnectedSocket()client:Socket
  ) :Promise<ITaskRO> {
    const user = client.data.user;
    const task = await this.taskService.create(user.id, data);
    //this.server.emit('taskCreated', task);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('updateTask')
  async handleUpdateTask(
    @MessageBody() data: UpdateTaskDto &{taskId?:string},
    @ConnectedSocket() client: Socket
  ): Promise<ITaskRO> {
    const user = client.data.user;
    const taskData:UpdateTaskDto = {title:data.title, description: data.description, completed: data.completed}
    const updatedTask = await this.taskService.update(user.id, data.taskId, taskData);
    //this.server.emit('taskUpdated', updatedTask);
    return updatedTask;
  }


  emitEvent(task: any):void {
    /**Method to emit events in this case when a task created */
    this.server.emit('taskCreated', task);
  }
}

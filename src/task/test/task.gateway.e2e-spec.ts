import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import * as jwt from 'jsonwebtoken';
import { io, Socket } from 'socket.io-client';
import { TaskModule } from '../task.module';
import { PrismaService } from '../../prisma_service';
import { TaskService } from '../task.service';
import { TaskGateway } from '../task.gateway';
import { SECRET } from 'src/config';

describe('TaskGateway (e2e)', () => {
  let app: INestApplication;
  let socket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TaskModule],
      providers: [PrismaService, TaskService, TaskGateway],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();
    await app.listen(3000);
  });

  afterAll(async () => {
    if (socket) {
      socket.disconnect();
    }
    await app.close();
  });

  it('should connect to the WebSocket and create a task', async () => {
    const token = jwt.sign({ id: 'test-user-id' }, 'your_jwt_secret'); // Ensure the secret matches your JWT_SECRET

    // Connect to the WebSocket server
    socket = io('http://localhost:3000/ws/task', {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      forceNew: true,
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        resolve();
      });
      socket.on('connect_error', (err: any) => {
        reject(err);
      });
    });

    // Send a message to create a task
    const taskData = {
      title: 'New Task',
      description: 'This is a new task.',
    };

    socket.emit('createTask', taskData);

    const taskCreated = await new Promise<any>((resolve) => {
      socket.on('taskCreated', (task: any) => {
        resolve(task);
      });
    });

    expect(taskCreated).toHaveProperty('title', 'New Task');
    expect(taskCreated).toHaveProperty('description', 'This is a new task.');
  });

  it('should update a task via WebSocket', async () => {
    const token = jwt.sign({ id: 'test-user-id' }, SECRET); // Ensure the secret matches your JWT_SECRET

    // Connect to the WebSocket server
    socket = io('http://localhost:3000/ws/task', {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      forceNew: true,
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        resolve();
      });
      socket.on('connect_error', (err: any) => {
        reject(err);
      });
    });

    // Send a message to create a task
    const taskData = {
      title: 'New Task',
      description: 'This is a new task.',
    };

    socket.emit('createTask', taskData);

    const taskCreated = await new Promise<any>((resolve) => {
      socket.on('taskCreated', (task: any) => {
        resolve(task);
      });
    });

    // Send a message to update the task
    const updateTaskData = {
      taskId: taskCreated.id,
      title: 'Updated Task',
      description: 'This task has been updated.',
      completed: true,
    };

    socket.emit('updateTask', updateTaskData);

    const taskUpdated = await new Promise<any>((resolve) => {
      socket.on('taskUpdated', (task: any) => {
        resolve(task);
      });
    });

    expect(taskUpdated).toHaveProperty('title', 'Updated Task');
    expect(taskUpdated).toHaveProperty('description', 'This task has been updated.');
    expect(taskUpdated).toHaveProperty('completed', true);
  });
});

# TASK MANAGEMENT APP
A task management app RESTful Api for Create, Read/Retrieve, Update and Delete tasks operations. It also exposes a websocket endpoint to stream events when a task data is created or updated


## Description

[Nest](https://github.com/nestjs/nest) framework Task Management App for Niyo Group assesment.

## Installation
```bash
#clone file from github
$ git clone https://github.com/Charlez91/nestjs_task_app.git

#install dependencies
$ npm install
```

## DB SETUP
```bash
# Setup your .env according to .env_example
$ touch .env

# configure the schema.prisma according to your preferences
# perform db migration
$ npx prisma migrate dev --name init

#update your db with latest migration/model
$ npx prisma db push

#update schema.prisma file with update model schema
$ npx prisma db pull

# updates generate Prisma client library from schema
$ npx prisma generate
```

## Running the app
On Startup App Is exposed at port 3000(i.e http://localhost:3000) either with normal or using docker.
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# OR

#using docker
$ docker-compose build

#start
$ docker-compose up

#stop
$ docker-compose down
```

## SWAGGER/OPENAPI documentation
The App API endpoints are well documentated with Swagger/OpenAPI interactive UI.
After App startup visit [Documentation at: http://localhost:3000/docs](http://localhost:3000/docs) and interact and make API calls from the browser.

## DTO & RO DATA SCHEMAS
Data Input, validation and Return Objects to enable you build perfect requests
### TASK DTO Classes
* Create TASK DTO
```ts
export class CreateTaskDto {
    @IsNotEmpty()
    readonly title: string;

    @IsString()
    readonly description: string;
}
```

* Update Task DTO
```ts
export class UpdateTaskDto extends PartialType(CreateTaskDto){
    
    @IsBoolean()
    readonly completed?: boolean;
}
```
* List All Task Query DTO
```ts
class TasksQueryDto{
    
    @IsEnum(Status)
    readonly status?: Status;

    @IsNumberString()
    readonly page?:number;

    @IsNumberString()
    readonly limit?:number;

    @IsNumberString()
    readonly offset?:number;
}
```

### TASK RO(Return Object) Interfaces
```ts
export interface ITaskData{
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

export interface ITaskRO {
    task: ITaskData;
  }
  
  export interface ITasksRO {
    tasks: ITaskRO[];
    tasksCount: number;
    page?:number;
    offset?:number;
    limit?:number
  }
```
### USER RO(Return Objects) intefaces
```ts
export interface IUserData{
    username:string;
    email:string;
    token:string
}

export interface IUserRO{
    user:IUserData;
}
```

### USER DTO Classes
* Create User DTO
```ts
export const passwordOptions: IsStrongPasswordOptions = {
    minLength:8,
    minLowercase:1,
    minUppercase:1,
    minNumbers:1,
    minSymbols:1
}

export class CreateUserDto{

    @IsEmail()
    @IsNotEmpty()
    readonly email:string;

    @IsStrongPassword(passwordOptions)
    @IsNotEmpty()
    readonly password:string;


    @IsNotEmpty()
    username:string
}
```

* login user DTO
```ts
export class LoginUserDto{
    @IsEmail()
    @IsNotEmpty()
    readonly email:string;

    @IsStrongPassword(passwordOptions)
    @IsNotEmpty()
    readonly password:string;

}
```

* update User DTO
```ts
export class UpdateUserDto {
    @IsEmail()
    readonly email?: string;

    @IsNotEmpty()
    readonly username?: string;
  }
```



## Websocket
The websocket to stream events on task creation is exposed at [ws://localhost:3000/ws/task](https://localhost:3000/ws/task).

There are two messages/event which the socket subscribes to
* `createTask` Event/Messages and emits a `taskCreated` event whenever a new task is succesfully created containing the created task data

* `updateTask` Event/Messages and emit a `taskUpdated` event when a task has been success updated

To interact with the websocket and stream events from the clients side. In shell similar to Curl you can use `wscat` as shown below:
```bash
$ npm install -g wscat

$ wscat -c "ws://localhost:3000/ws/task?token=${jwt_token}
```
OR
You Can down PostMan and use there Requests socket.io method for websocket request
or you can use this Client side JS to test it
```javascript
const WebSocket = require('ws');

// Replace this with the actual token
const token = 'jwt_token';//for authorization

// WebSocket server URL with token as a query parameter
const wsUrl = `ws://localhost:3000/ws/task?token=${token}`;

// Create a WebSocket connection
const socket = new WebSocket(wsUrl);


// Event handler for when the WebSocket connection is established
socket.on('open', () => {
  console.log('WebSocket connection established.');

  // Send a message to create a task
  const taskData = {
    title: 'New Task',
    description: 'This is a new task.',
    // Add any additional properties as needed
  };

  const message = {
    type: 'createTask',
    data: taskData,
  };

  // Send the message as a JSON string
  socket.send(JSON.stringify(message));
});

// Event handler for incoming messages from the WebSocket server
socket.on('message', (data) => {
  console.log('Received message from server:', data);
});

// Event handler for WebSocket errors
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Event handler for when the WebSocket connection is closed
socket.on('close', (code, reason) => {
  console.log(`WebSocket connection closed: ${code} - ${reason}`);
});

```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

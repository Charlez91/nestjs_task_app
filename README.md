# TASK MANAGEMENT APP
A task management app for Create, Read/Retrieve, Update and Delete tasks with a websocket endpoint


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

#update schema.prisma file with update model schema
$ npx prisma db pull

#update your db with latest migration/model
$ npx prisma db push

# updates generate Prisma client library from schema
$ npx prisma generate
```

## Running the app
On Startup App Is exposed at port 3000(i.e http://localhost:3000)
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## SWAGGER/OPENAPI documentation
The App API endpoints are well documentated with OpenApi interactive UI.
After App startup visit [Documentation at: http://localhost:3000/docs](http://localhost:3000/docs) and interact and make API calls from the browser.

## Websocket
The websocket to stream events on task creation is exposed at [ws://localhost:3000/ws/task](https://localhost:3000/ws/task).

There are two events which the socket subscribes to
* `createTask` Event
* `updateTask` Event

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

import { Body, Controller, Get, Param, Post, Put, Query, Delete } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TaskService } from "./task.service";
import { User } from "src/user/user.decorator";
import { CreateTaskDto, TasksQueryDto, UpdateTaskDto } from "./dto";
import { ITaskRO, ITasksRO } from "./task.interface";


@ApiBearerAuth()
@ApiTags("tasks")
@Controller("tasks")
export class TaskController{
    constructor(private readonly taskservice : TaskService){}

    @ApiOperation({ summary: 'Get all tasks' })
    @ApiResponse({ status: 200, description: 'Return all tasks.' })
    @Get()
    async listTasks( 
        @User("id") userId:string, 
        @Query() query:TasksQueryDto,
    ):Promise<ITasksRO>{
        /*List All Tasks of current user */

        const completed = query && "status" in query
            ? query.status === 'completed'
                ? true
                : query.status === 'pending'
                    ? false
                    : undefined
                : undefined;

        let limit = query && "limit"in query?+query.limit:20;
        let page = query && "page" in query?+query.page:1;
        let offset = query && "offset" in query?Number(query.offset):undefined;
        const skip = !!offset?offset:((page-1)*limit);
        const take = limit        
        return this.taskservice.findAll(userId, skip, take, completed)
    }


    @ApiOperation({ summary: 'Retrieve/Get A Task by ID' })
    @ApiResponse({ status: 200, description: 'Task has been successfully retrieved.' })
    @ApiResponse({ status: 404, description: 'Task Not Found.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Get(":id")
    async getTask(
        @User("id") userId:string,
        @Param("id") taskId:string
    ):Promise<ITaskRO>{
        /* Retrieve A task By Id */
        return this.taskservice.findOne(userId, taskId)
    }

    @ApiOperation({ summary: 'Retrieve/Get A Task by ID' })
    @ApiResponse({ status: 200, description: 'Task has been successfully retrieved.' })
    @ApiResponse({ status: 404, description: 'Task Not Found.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Get(":title")
    async getTaskbyTitle(
        @User("id") userId:string,
        @Param("title") title:string
    ):Promise<ITaskRO>{
        /* Retrieve A task By Id */
        return this.taskservice.findOneByTitle(userId, title)
    }

    @ApiOperation({ summary: 'Create Task' })
    @ApiResponse({ status: 201, description: 'Task has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Post()
    async createTask(
        @User("id") userId:string, 
        @Body("task") taskData: CreateTaskDto
    ):Promise<ITaskRO>{
        /* Create A new Task */
        return this.taskservice.create(userId, taskData)
    }

    @ApiOperation({ summary: 'Update Task' })
    @ApiResponse({ status: 201, description: 'The Task has been successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Task Not Found.' })
    @Put(":id")
    async updateTask(
        @User("id") userId:string, 
        @Body("task") taskData:UpdateTaskDto, 
        @Param("id") taskId: string
    ){
        /**Update Task*/
        return this.taskservice.update(userId, taskId, taskData)
    }

    @ApiOperation({ summary: 'Delete Task' })
    @ApiResponse({ status: 201, description: 'The Task has been successfully deleted.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Delete(':id')
    async delete( @User("id") userId:string, @Param() params: Record<string, string>) {
        /**Delete a task */
        return this.taskservice.delete(userId, params.id)
    }



}
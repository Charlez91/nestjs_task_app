import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma_service/prisma.service";
import { validate } from "class-validator";
import { ITasksRO, ITaskRO, ITaskData } from "./task.interface";
import { CreateTaskDto, UpdateTaskDto } from "./dto";
//import { UserService } from "src/user/user.service";
import { Task } from "@prisma/client";
import { TaskGateway } from "./task.gateway";


/**
 * Service responsible for handling task-related operations.
 */
@Injectable()
export class TaskService{
    constructor(
        private readonly prisma:PrismaService,
        //private readonly userService:UserService
        private readonly taskGateway:TaskGateway
    ){}

    async findAll(
        userId:string, page:number, offset:number,
        limit:number, completed:boolean,
    ):Promise<ITasksRO>{
        const skip = !!offset?offset:((page-1)*limit);
        const take = limit
        const tasks = this.prisma.task.findMany({
            skip,
            take,
            where:{
                authorId:userId,
                completed
            },
            orderBy:{
                title:'asc'
            }
        });
        const tasksCount = this.prisma.task.count({
            where:{
                authorId:userId,
                completed
            }
        })
        const [data, total] = await this.prisma.$transaction([tasks, tasksCount])
        let taskList = data.map((task)=>this.buildTaskRO(task));
        return {tasks:taskList, tasksCount:total, page, offset, limit} as const;
    }

    async findOne(userId:string, taskId:string):Promise<ITaskRO>{
        let task= await this.prisma.task.findUnique({
            where:{
                id:taskId,
                authorId:userId
            },
        });
        if (!task){
            throw new HttpException(
                "Task Does Not exist",HttpStatus.NOT_FOUND
            );
        }
        return this.buildTaskRO(task)
        
    }

    async findOneByTitle(userId:string, title:string):Promise<ITaskRO>{
        let task= await this.prisma.task.findFirst({
            where:{
                title,
                authorId:userId
            },
        });
        if (!task){
            throw new HttpException(
                "Task Does Not exist",HttpStatus.NOT_FOUND
            );
        }
        return this.buildTaskRO(task)
        
    }

    async create(
        userId:string, taskData:CreateTaskDto
    ):Promise<ITaskRO>{
        /**
        * Create Task Service Method. To create new tasks 
        */
       const {title, description} = taskData;
       const taskExists = await this.prisma.task.count({
            where:{
                title:title,
                authorId:userId,
            }
       });
       if(taskExists>0){
            throw new HttpException(
                {
                message: 'Input data validation failed',
                errors: { Data: 'A Task with same title exists. Titles must be unique' },
                }, 
                HttpStatus.BAD_REQUEST
            );
       };

       const errors = await validate(taskData)//might not be needed cos validation pipe should have taken care of data validation
        if (errors.length > 0) {
          throw new HttpException(
            {
              message: 'Input data validation failed',
              errors: { Data: 'Task Data is not valid.' },
            },
            HttpStatus.BAD_REQUEST,
          );
        } else {
            const data = {...taskData, authorId:userId};
            const task = await this.prisma.task.create({
                data
            });
            // Emit the task created event
            this.taskGateway.server.emit('taskCreated',task);
            return this.buildTaskRO(task!)
        }
    }

    async update(
        userId:string, taskId:string, taskData:UpdateTaskDto
    ):Promise<ITaskRO>{
        const task = await this.prisma.task.findUnique({//check if task exists
            where:{
                id:taskId,
                authorId:userId
            }
        });
        const checkTitle = taskData.title? await this.prisma.task.count({//check for duplicate title in user tasks not currnt task
            where:{
                title:taskData.title,
                authorId:userId,
                NOT:{
                    id:taskId
                }
            }
        }):undefined;
        //const [taskCheck, titleCheck] = await this.prisma.$transaction([task, checkTitle])
        if (!task){
            throw new HttpException({
              'message':'This Task with id does not exist', 
              'errors':{Task:'Not Found'}}, 
              HttpStatus.NOT_FOUND)
        };
        if (checkTitle && checkTitle>0){
            throw new HttpException({
              'message':'One of Your Task with Title already exists.  Choose another title', 
              'errors':{Task:'Title exist with another task'}}, 
              HttpStatus.FORBIDDEN)
        };
        
        const updatedTask = await this.prisma.task.update({
            where:{
                id:taskId,
                authorId:userId,
            },
            data:taskData
        });
        this.taskGateway.server.emit("taskUpdated", updatedTask);
        return this.buildTaskRO(updatedTask!);
    }

    async delete(userId:string, taskId:string):Promise<any>{
        //const user = this.userService.findById({id:userId});
        const task = await this.prisma.task.findUnique({
            where:{
                id:taskId
            }});
        if(task && task.authorId==userId){
            return this.prisma.task.delete({
                where:{
                    id:taskId,
                    authorId:userId
                }
            });
        }else{
            throw new HttpException(
                "Task couldnt be deleted. check if the task exists and you the author.", 
                HttpStatus.BAD_REQUEST
            );
        }
    }

    private buildTaskRO(task: Task):ITaskRO {
        const taskRO:ITaskData = {
            id: task.id,
            title: task.title,
            description: task.description,
            completed: task.completed,
        };
    
        return { task:taskRO } as const;
    }
}
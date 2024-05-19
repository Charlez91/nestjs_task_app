
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
  }
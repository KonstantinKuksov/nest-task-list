import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task as TaskEntity } from './task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {}

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getFilteredTasks(filterDto: GetTasksFilterDto) {
    const { status, search } = filterDto;
    let tasks = this.getAllTasks();
    if (status) {
      tasks = tasks.filter((task: Task) => task.status === status);
    }
    if (search) {
      tasks = tasks.filter(
        (task: Task) =>
          task.description.includes(search) || task.title.includes(search),
      );
    }
    return tasks;
  }

  getTaskById(id: string): Task {
    const task = this.tasks.find((task: Task) => task.id === id);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };
    this.tasks.push(task);
    return task;
  }

  updateTaskStatus(id: string, statusDto: UpdateTaskStatusDto): Task {
    const task = this.getTaskById(id);
    const { status } = statusDto;
    task.status = status;
    return task;
  }

  deleteTask(id: string): void {
    const task = this.getTaskById(id);
    this.tasks.splice(this.tasks.indexOf(task), 1);
  }
}

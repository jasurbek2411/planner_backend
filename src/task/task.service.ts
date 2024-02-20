import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    return await this.prisma.task.findMany({ where: { userId } });
  }

  async create(dto: TaskDto, userId: string) {
    return await this.prisma.task.create({
      data: {
        ...dto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async update(dto: Partial<TaskDto>, taskId: string, userId: string) {
    return await this.prisma.task.update({
      where: {
        id: taskId,
        user: { id: userId },
      },
      data: dto,
    });
  }

  async delete(taskId: string) {
    return await this.prisma.task.delete({ where: { id: taskId } });
  }
}

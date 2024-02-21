import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TimeBlockDto } from './dto/time-block.dto';

@Injectable()
export class TimeBlockService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    return await this.prisma.timeBlock.findMany({
      where: {
        userId,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async create(dto: TimeBlockDto, userId: string) {
    const blocks = await this.getAll(userId);
    return await this.prisma.timeBlock.create({
      data: {
        ...dto,
        order: blocks.length,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async update(dto: TimeBlockDto, timeBlockId: string, userId: string) {
    return await this.prisma.timeBlock.update({
      where: {
        id: timeBlockId,
        userId,
      },
      data: dto,
    });
  }

  async delete(timeBlockId: string) {
    return await this.prisma.timeBlock.delete({
      where: {
        id: timeBlockId,
      },
    });
  }

  async updateOrder(ids: string[]) {
    return await this.prisma.$transaction(
      ids.map((id, order) =>
        this.prisma.timeBlock.update({
          where: { id },
          data: { order },
        }),
      ),
    );
  }
}

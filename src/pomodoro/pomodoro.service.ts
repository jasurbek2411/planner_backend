import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PomodoroRoundDto, PomodoroSessionDto } from './dto/pomodor-dto';

@Injectable()
export class PomodoroService {
  constructor(private prisma: PrismaService) {}

  async getTodaySession(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    return await this.prisma.pomodoroSession.findFirst({
      where: {
        createdAt: {
          gte: new Date(today),
        },
        userId,
      },
      include: {
        rounds: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });
  }

  async create(userId: string) {
    const todaySessoin = await this.getTodaySession(userId);

    if (todaySessoin) return todaySessoin;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: { intervalsCount: true },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return await this.prisma.pomodoroSession.create({
      data: {
        rounds: {
          createMany: {
            data: Array.from({ length: user.intervalsCount }, () => ({
              totalSeconds: 0,
            })),
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        rounds: true,
      },
    });
  }

  async update(
    dto: Partial<PomodoroSessionDto>,
    pomodorId: string,
    userId: string,
  ) {
    return await this.prisma.pomodoroSession.update({
      where: {
        userId,
        id: pomodorId,
      },
      data: dto,
    });
  }

  async updateRound(dto: Partial<PomodoroRoundDto>, roundId: string) {
    return await this.prisma.pomodoroRound.update({
      where: {
        id: roundId,
      },
      data: dto,
    });
  }

  async deleteSession(sessionId: string, userId: string) {
    return await this.prisma.pomodoroSession.delete({
      where: {
        userId,
        id: sessionId,
      },
    });
  }
}

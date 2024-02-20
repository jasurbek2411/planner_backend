import { Injectable } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'argon2';
import { UserDto } from './dto/user.dto';
import { startOfDay, subDays } from 'date-fns';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });
  }

  async getProfile(id: string) {
    const profile = await this.getById(id);

    const totalTasks = profile.tasks.length;
    const compeltedTasks = this.prisma.task.count({
      where: { id, isCompleted: true },
    });

    const todayStart = startOfDay(new Date());
    const weekStart = startOfDay(subDays(new Date(), 7));

    const todayTasks = await this.prisma.task.count({
      where: {
        id,
        createdAt: { gte: todayStart.toISOString() },
      },
    });

    const weekTasks = await this.prisma.task.count({
      where: {
        id,
        createdAt: { gte: weekStart.toISOString() },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = profile;

    return {
      user: rest,
      statistics: [
        { label: 'Total', value: totalTasks },
        { label: 'Completed Tasks', value: compeltedTasks },
        { label: 'Today tasks', value: todayTasks },
        { label: 'Week tasks', value: weekTasks },
      ],
    };
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(dto: AuthDto) {
    const hashPassword = await hash(dto.password);

    const data = {
      email: dto.email,
      password: hashPassword,
      updatedAt: null,
      name: '',
    };

    const user = this.prisma.user.create({
      data,
    });

    return user;
  }

  async update(id: string, dto: UserDto) {
    let data = dto;

    if (dto.password) {
      data = { ...dto, password: await hash(dto.password) };
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        name: true,
        email: true,
      },
    });
  }
}

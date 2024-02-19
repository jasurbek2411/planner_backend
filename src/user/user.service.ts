import { Injectable } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'argon2';

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
}

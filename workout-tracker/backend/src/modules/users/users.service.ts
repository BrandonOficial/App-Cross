import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        height: true,
        weight: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    // Garante que o usuário existe antes de tentar atualizar
    await this.getProfile(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.weight !== undefined && { weight: data.weight }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        height: true,
        weight: true,
        createdAt: true,
      },
    });
  }
}

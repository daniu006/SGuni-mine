import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PrismaUsersService } from 'src/prisma/PrismaUsersService';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LoginService {
  constructor(private prisma: PrismaUsersService) { }

  async create(createLoginDto: CreateLoginDto) {
    const exist = await this.prisma.user.findFirst({
      where: { email: createLoginDto.email },
    });

    if (exist) {
      throw new BadRequestException('El correo ya está registrado');
    }
    const hashedPassword = await bcrypt.hash(createLoginDto.password, 10);

    const newLogin = await this.prisma.user.create({
      data: {
        email: createLoginDto.email,
        password: hashedPassword,
        name: createLoginDto.email.split('@')[0],
        roleId: 3,
      },
    });

    const { password, ...userWithoutPassword } = newLogin;

    return {
      message: 'Usuario creado correctamente',
      data: userWithoutPassword,
    };
  }

  /** Obtener todos los usuarios */
  async findAll() {
    const data = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Lista de usuarios obtenida correctamente',
      data,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      message: 'Usuario encontrado correctamente',
      data: user,
    };
  }

  async update(id: number, updateLoginDto: UpdateLoginDto) {
    const exist = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const dataToUpdate: any = {};
    if (updateLoginDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateLoginDto.password, 10);
    }
    if (updateLoginDto.email) {
      dataToUpdate.email = updateLoginDto.email;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        roleId: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Usuario actualizado correctamente',
      data: updated,
    };
  }

  async remove(id: number) {
    const exist = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'Usuario eliminado correctamente',
    };
  }
}
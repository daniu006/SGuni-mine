import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';
import { PrismaAcademicService } from 'src/prisma/PrismaAcademicService';

@Injectable()
export class CicloService {
  constructor(private readonly prisma: PrismaAcademicService) {}

  async create(createCicloDto: CreateCicloDto) {
    try {
      const ciclo = await this.prisma.cycle.create({
        data: {
          name: createCicloDto.name,
          year: createCicloDto.year,
          period: createCicloDto.period,
          startDate: new Date(createCicloDto.startDate),
          endDate: new Date(createCicloDto.endDate),
        },
      });

      console.log('✓ Ciclo creado correctamente');
      return ciclo;
    } catch (error) {
      throw new ConflictException('Error al crear el ciclo');
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [ciclos, total] = await Promise.all([
        this.prisma.cycle.findMany({
          skip,
          take: limit,
          select: {
            name: true,
            id: true,
            year: true,
            period: true,
            isActive: true,
          },
        }),
        this.prisma.cycle.count(),
      ]);

      console.log('✓ Ciclos encontrados');
      return {
        data: ciclos,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error('Error al obtener ciclos');
    }
  }

  async findOne(id: number) {
    try {
      const ciclo = await this.prisma.cycle.findUnique({
        where: { id },
        include: {
          subjects: true,
        },
      });

      if (!ciclo) {
        throw new NotFoundException('Ciclo no encontrado');
      }

      console.log(' Ciclo encontrado');
      return ciclo;
    } catch (error) {
      console.error('Error al buscar ciclo:', error);
      throw error;
    }
  }


  async update(id: number, updateCicloDto: UpdateCicloDto) {
    try {
      const existingCiclo = await this.prisma.cycle.findUnique({
        where: { id },
      });

      if (!existingCiclo) {
        throw new NotFoundException('Ciclo no encontrado');
      }

      const data: any = { ...updateCicloDto };
      if (updateCicloDto.startDate) {
        data.startDate = new Date(updateCicloDto.startDate);
      }
      if (updateCicloDto.endDate) {
        data.endDate = new Date(updateCicloDto.endDate);
      }

      const cicloActualizado = await this.prisma.cycle.update({
        where: { id },
        data,
      });

      console.log('✓ Ciclo actualizado correctamente');
      return cicloActualizado;
    } catch (error) {
      console.error('✗ Error al actualizar el ciclo:', error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const existingCiclo = await this.prisma.cycle.findUnique({
        where: { id },
      });

      if (!existingCiclo) {
        throw new NotFoundException('Ciclo no encontrado');
      }

      console.log('✓ Ciclo encontrado, puede borrarse');

      await this.prisma.cycle.delete({
        where: { id },
      });

      return { message: 'Ciclo eliminado correctamente' };
    } catch (error) {
      console.error('✗ Error al eliminar el ciclo:', error);
      throw error;
    }
  }
}

import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { PrismaAcademicService } from 'src/prisma/PrismaAcademicService';

@Injectable()
export class CarreraService {
  constructor(private readonly prisma: PrismaAcademicService) { }

  //
  async create(createCarreraDto: CreateCarreraDto) {
    try {
      const carrera = await this.prisma.career.create({
        data: {
          name: createCarreraDto.nombre,
          totalCicles: 0,
          durationYears: 0,
        },
      });

      console.log('Carrera creada correctamente');
      return carrera;
    } catch {
      throw new ConflictException('Error al crear la carrera');
    }
  }

  //
  async findAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [carreras, total] = await Promise.all([
        this.prisma.career.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
          },
        }),
        this.prisma.career.count(),
      ]);

      console.log('Carreras encontradas');
      return {
        data: carreras,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      };
    } catch {
      throw new InternalServerErrorException('Error al obtener carreras');
    }
  }

  //
  async findOne(id: number) {
    try {
      const carrera = await this.prisma.career.findUnique({
        where: { id },
        include: {
          subjects: true,
        },
      });

      if (!carrera) {
        throw new NotFoundException('Carrera no encontrada');
      }

      console.log('✓ Carrera encontrada');
      return carrera;
    } catch (e) {
      console.error('Error al buscar carrera:', e);
      throw e;
    }
  }

  //
  async update(id: number, updateCarreraDto: UpdateCarreraDto) {
    try {
      const existingCarrera = await this.prisma.career.findUnique({
        where: { id },
      });

      if (!existingCarrera) {
        throw new NotFoundException('Carrera no encontrada');
      }

      const carreraActualizada = await this.prisma.career.update({
        where: { id },
        data: updateCarreraDto,
      });

      console.log('✓ Carrera actualizada correctamente');
      return carreraActualizada;
    } catch (e) {
      console.error('✗ Error al actualizar la carrera:', e);
      throw e;
    }
  }

  async remove(id: number) {
    try {
      const existingCarrera = await this.prisma.career.findUnique({
        where: { id },
      });

      if (!existingCarrera) {
        throw new NotFoundException('Carrera no encontrada');
      }

      console.log('✓ Carrera encontrada, puede borrarse');

      await this.prisma.career.delete({
        where: { id },
      });

      return { message: 'Carrera eliminada correctamente' };
    } catch (e) {
      console.error('✗ Error al eliminar la carrera:', e);
      throw e;
    }
  }

  // PARTE 1 - CONSULTA 2: Materias asociadas a una carrera específica
  async getSubjectsByCareer(
    careerId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      // Verificar que existe la carrera
      const carrera = await this.prisma.career.findUnique({
        where: { id: careerId },
      });

      if (!carrera) {
        throw new NotFoundException('Carrera no encontrada');
      }

      const skip = (page - 1) * limit;

      const [materias, total] = await Promise.all([
        this.prisma.subject.findMany({
          where: {
            careerId: careerId,
          },
          skip,
          take: limit,
          include: {
            cycle: {
              select: {
                id: true,
                name: true,
                year: true,
                period: true,
                isActive: true,
              },
            },
          },
          orderBy: [
            {
              cicleNumber: 'asc',
            },
            {
              name: 'asc',
            },
          ],
        }),
        this.prisma.subject.count({
          where: {
            careerId: careerId,
          },
        }),
      ]);

      console.log('✓ Materias de la carrera encontradas');
      return {
        career: {
          id: carrera.id,
          name: carrera.name,
          totalCicles: carrera.totalCicles,
          durationYears: carrera.durationYears,
        },
        subjects: materias,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (e) {
      console.error('Error al obtener materias de la carrera:', e);
      throw e;
    }
  }
}
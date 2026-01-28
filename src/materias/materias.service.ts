import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { PrismaAcademicService } from 'src/prisma/PrismaAcademicService';

@Injectable()
export class MateriasService {
  constructor(private readonly prisma: PrismaAcademicService) {}
  async create(
    createMateriaDto: CreateMateriaDto,
    id_docente: number,
    id_carrera: number,
    id_ciclo: number
  ) {
    try {

      const docente = await this.prisma.career.findUnique({
        where: { id: id_carrera },
      });
      if (!docente) {

        throw new NotFoundException('Carrera no encontrada');
      }
      // Verificar que existe la carrera
      const carrera = await this.prisma.career.findUnique({
        where: { id: id_carrera },
      });
      if (!carrera) {
        throw new NotFoundException('Carrera no encontrada');
      }
      // Verificar que existe el ciclo
      const ciclo = await this.prisma.cycle.findUnique({
        where: { id: id_ciclo },
      });
      if (!ciclo) {
        throw new NotFoundException('Ciclo no encontrado');
      }
      const materia = await this.prisma.subject.create({
        data: {
          name: createMateriaDto.nombre,
          careerId: id_carrera,
          cicleNumber: 1,
        },
        include: {
          career: true,
          cycle: true,
        },
      });
      console.log('✓ Materia creada correctamente');
      return materia;
    } catch (e) {
      console.error('Error al crear la materia:', e);
      throw e;
    }
  }

  async findAll(page: number=1, limit: number=10) {
    try {
      const skip = (page - 1) * limit;

      const [Materias, total] = await Promise.all([
      this.prisma.subject.findMany({
        skip,    
        take: limit, 
        select: { 
          id: true,
          name: true,
          careerId: true,
          cicleNumber: true,
          cycleId: true
        },
      }),
      this.prisma.subject.count(), 
    ]);

    console.log('✓ Materias encontradas');
    return {
      data: Materias,
      meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      },
    };
    } catch (e) {
      console.error('Error al obtener materias:', e);
    }
  }

  async findOne(id: number) {
    try {
      const materia = await this.prisma.subject.findUnique({
        where: { id },
        include: {
          career: true,
          cycle: true,
        },
      });

      if (!materia) {
        throw new NotFoundException('Materia no encontrada');
      }

      console.log('✓ Materia encontrada');
      return materia;
    } catch (e) {
      console.error('Error al buscar materia:', e);
      throw e;
    }
  }

  async update(
    id: number,
    updateMateriaDto: UpdateMateriaDto,
    id_docente: number,
    id_carrera: number,
    id_ciclo: number
  ) {
    try {
      const existingMateria = await this.prisma.subject.findUnique({
        where: { id },
      });
      if (!existingMateria) {
        throw new NotFoundException('Materia no encontrada');
      }
      // Verificar carrera
      const carrera = await this.prisma.career.findUnique({
        where: { id: id_carrera },
      });
      if (!carrera) {
        throw new NotFoundException('Carrera no encontrada');
      }
      // Verificar ciclo
      const ciclo = await this.prisma.cycle.findUnique({
        where: { id: id_ciclo },
      });
      if (!ciclo) {
        throw new NotFoundException('Ciclo no encontrado');
      }
      const materiaActualizada = await this.prisma.subject.update({
        where: { id },
        data: {
          ...updateMateriaDto,
          careerId: id_carrera,
          cicleNumber: 1,
        },
        include: {
          career: true,
          cycle: true,
        },
      });
      console.log('✓ Materia actualizada correctamente');
      return materiaActualizada;
    } catch (e) {
      console.error('Error al actualizar la materia:', e);
      throw e;
    }
  }


  async remove(id: number) {
    try {
      const existingMateria = await this.prisma.subject.findUnique({
        where: { id },
      });

      if (!existingMateria) {
        throw new NotFoundException('Materia no encontrada');
      }

      console.log('✓ Materia encontrada, puede borrarse');

      await this.prisma.subject.delete({
        where: { id },
      });

      return { message: 'Materia eliminada correctamente' };
    } catch (e) {
      console.error('Error al eliminar la materia:', e);
      throw e;
    }
  }
}


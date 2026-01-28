import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { PrismaProfilesService } from 'src/prisma/PrismaProfilesService';
import { FilterDocenteDto } from './dto/filter-docente.dto';
import { Prisma } from '@prisma/client-profiles';

@Injectable()
export class DocenteService {
  constructor(private readonly prisma: PrismaProfilesService) { }
  //

  async create(createDocenteDto: CreateDocenteDto, id_especialidad: number) {
    try {
      const especialidad = await this.prisma.specialityReference.findUnique({
        where: { id: id_especialidad },
      });
      if (!especialidad) {
        throw new NotFoundException('Especialidad no encontrada');
      }
      const docente = await this.prisma.teacherProfile.create({
        data: {
          userId: 0,
          specialityId: id_especialidad,
          careerId: 0,
          employmentType: 'FULL_TIME', // Valor por defecto
        },
        include: {
          speciality: true,
        },
      });
      console.log('✓ Docente creado correctamente');
      return docente;
    } catch (e) {
      console.error('Error al crear el docente:', e);
      throw e;
    }
  }

  //

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [docentes, total] = await Promise.all([
        this.prisma.teacherProfile.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            userId: true,
            specialityId: true,
            careerId: true,
          },
        }),
        this.prisma.teacherProfile.count(),
      ]);

      console.log('✓ Docentes encontrados');

      return {
        data: docentes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      throw new Error('Error al obtener docentes');
    }
  }


  //

  async findOne(id: number) {
    try {
      const docente = await this.prisma.teacherProfile.findUnique({
        where: { id },
        include: {
          speciality: true,
          subjects: true,
        },
      });

      if (!docente) {
        throw new NotFoundException('Docente no encontrado');
      }

      console.log('✓ Docente encontrado');
      return docente;
    } catch (e) {
      console.error('✗ Error al buscar docente:', e);
      throw e;
    }
  }
  //

  async update(id: number, updateDocenteDto: UpdateDocenteDto, id_especialidad: number) {
    try {
      const existingDocente = await this.prisma.teacherProfile.findUnique({
        where: { id },
      });
      if (!existingDocente) {
        throw new NotFoundException('Docente no encontrado');
      }
      // Verificar que existe la especialidad
      const especialidad = await this.prisma.specialityReference.findUnique({
        where: { id: id_especialidad },
      });
      if (!especialidad) {
        throw new NotFoundException('Especialidad no encontrada');
      }
      const docenteActualizado = await this.prisma.teacherProfile.update({
        where: { id },
        data: {
          ...updateDocenteDto,
          specialityId: id_especialidad,
        },
        include: {
          speciality: true,
        },
      });
      console.log('✓ Docente actualizado correctamente');
      return docenteActualizado;
    } catch (e) {
      console.error('Error al actualizar el docente:', e);
      throw e;
    }
  }
  //

  async remove(id: number) {
    try {
      const existingDocente = await this.prisma.teacherProfile.findUnique({
        where: { id },
      });

      if (!existingDocente) {
        throw new NotFoundException('Docente no encontrado');
      }

      console.log('✓ Docente encontrado, puede borrarse');

      await this.prisma.teacherProfile.delete({
        where: { id },
      });


      return { message: 'Docente eliminado correctamente' };
    } catch (e) {
      console.error('Error al eliminar el docente:', e);
      throw e;
    }
  }

  // PARTE 2: Consulta 2 - Filtrado con operadores AND, OR, NOT
  async findByComplexFilters(
    filters: FilterDocenteDto,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Construir condiciones complejas con AND, OR, NOT
      const whereConditions: Prisma.TeacherProfileWhereInput = {
        AND: [],
      };

      // Operador AND: employmentType
      if (filters.employmentType) {
        (whereConditions.AND as any[]).push({
          employmentType: filters.employmentType,
        });
      }

      // Operador AND: careerId específico
      if (filters.careerId) {
        (whereConditions.AND as any[]).push({
          careerId: filters.careerId,
        });
      }

      // Operador OR: specialityId IN (array de IDs)
      if (filters.specialityIds && filters.specialityIds.length > 0) {
        (whereConditions.AND as any[]).push({
          specialityId: {
            in: filters.specialityIds,
          },
        });
      }

      // Operador NOT: careerId NOT IN (array de IDs excluidos)
      if (filters.excludeCareerIds && filters.excludeCareerIds.length > 0) {
        (whereConditions.AND as any[]).push({
          careerId: {
            notIn: filters.excludeCareerIds,
          },
        });
      }

      // Si no hay filtros, eliminar el AND vacío
      if ((whereConditions.AND as any[]).length === 0) {
        delete whereConditions.AND;
      }

      const [docentes, total] = await Promise.all([
        this.prisma.teacherProfile.findMany({
          where: whereConditions,
          skip,
          take: limit,
          include: {
            speciality: true,
            career: true,
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        }),
        this.prisma.teacherProfile.count({
          where: whereConditions,
        }),
      ]);

      console.log('✓ Docentes filtrados encontrados');
      return {
        data: docentes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          filters: whereConditions,
        },
      };
    } catch (e) {
      console.error('Error al filtrar docentes:', e);
      throw e;
    }
  }

  // PARTE 1 - CONSULTA 3: Docentes que imparten más de una asignatura
  async getTeachersWithMultipleSubjects(
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Usar groupBy para contar asignaturas por docente
      const teachersWithCount = await this.prisma.subjectAssignment.groupBy({
        by: ['teacherProfileId'],
        _count: {
          subjectId: true,
        },
        having: {
          subjectId: {
            _count: {
              gt: 1, // Mayor que 1 (más de una asignatura)
            },
          },
        },
        orderBy: {
          _count: {
            subjectId: 'desc', // Ordenar por cantidad de asignaturas (descendente)
          },
        },
      });

      // Obtener IDs de docentes que cumplen la condición
      const teacherIds = teachersWithCount.map((t) => t.teacherProfileId);

      // Contar total
      const total = teacherIds.length;

      // Aplicar paginación manual
      const paginatedIds = teacherIds.slice(skip, skip + limit);

      // Obtener información completa de los docentes paginados
      const docentes = await this.prisma.teacherProfile.findMany({
        where: {
          id: {
            in: paginatedIds,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            },
          },
          speciality: {
            select: {
              id: true,
              name: true,
            },
          },
          career: {
            select: {
              id: true,
              name: true,
            },
          },
          subjects: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  cicleNumber: true,
                },
              },
            },
          },
        },
      });

      // Mapear resultados con el conteo de asignaturas
      const docentesConConteo = docentes.map((docente) => {
        const countData = teachersWithCount.find(
          (t) => t.teacherProfileId === docente.id,
        );
        return {
          ...docente,
          subjectCount: countData?._count.subjectId || 0,
        };
      });

      // Ordenar por cantidad de asignaturas
      docentesConConteo.sort((a, b) => b.subjectCount - a.subjectCount);

      console.log('✓ Docentes con múltiples asignaturas encontrados');
      return {
        data: docentesConConteo,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (e) {
      console.error('Error al obtener docentes con múltiples asignaturas:', e);
      throw e;
    }
  }
}
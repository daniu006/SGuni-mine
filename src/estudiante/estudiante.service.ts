import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { PrismaProfilesService } from 'src/prisma/PrismaProfilesService';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { FilterEstudianteDto } from './dto/filter-estudiante.dto';
import { ReportDto } from './dto/report.dto';
import { Prisma } from '@prisma/client-profiles';
import { EnrollStudentDto } from './dto/enroll-student.dto';


@Injectable()
export class EstudianteService {
  constructor(private readonly prisma: PrismaProfilesService) { }

  async create(createEstudianteDto: CreateEstudianteDto, id_carrera: number) {
    try {

      // Verificar que existe la carrera
      const carrera = await this.prisma.careerReference.findUnique({
        where: { id: id_carrera },
      });
      if (!carrera) {
        throw new NotFoundException('Carrera no encontrada');
      }
      const estudiante = await this.prisma.studentProfile.create({
        data: {
          userId: 0,
          careerId: id_carrera,
          currentCicle: 1,
        },
        include: {
          career: true,
        },
      });
      console.log('✓ Estudiante creado correctamente');
      return estudiante;
    } catch (e) {
      console.error('Error al crear el estudiante:', e);
      throw e;
    }
  }

  //
  async findAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [estudiantes, total] = await Promise.all([
        this.prisma.studentProfile.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            userId: true,
            careerId: true,
            currentCicle: true,
          },
        }),
        this.prisma.studentProfile.count(),
      ]);

      console.log('✓ Estudiantes encontrados');
      return {
        data: estudiantes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

    } catch {
      throw new Error('Error al obtener estudiantes');
    }
  }

  //
  async findOne(id: number) {
    try {
      const estudiante = await this.prisma.studentProfile.findUnique({
        where: { id },
        include: {
          career: true,
        },
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      console.log('✓ Estudiante encontrado');
      return estudiante;
    } catch (e) {
      console.error('Error al buscar estudiante:', e);
      throw e;
    }
  }
  //

  async update(id: number, updateEstudianteDto: UpdateEstudianteDto, id_carrera: number) {
    try {
      const existingEstudiante = await this.prisma.studentProfile.findUnique({
        where: { id },
      });
      if (!existingEstudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }
      const carrera = await this.prisma.careerReference.findUnique({
        where: { id: id_carrera },
      });
      if (!carrera) {
        throw new NotFoundException('Carrera no encontrada');
      }
      const estudianteActualizado = await this.prisma.studentProfile.update({
        where: { id },
        data: {
          ...updateEstudianteDto,
          careerId: id_carrera,
        },
        include: {
          career: true,
        },
      });
      console.log('✓ Estudiante actualizado correctamente');
      return estudianteActualizado;
    } catch (e) {
      console.error('Error al actualizar el estudiante:', e);
      throw e;
    }
  }

  //
  async remove(id: number) {
    try {
      const existingEstudiante = await this.prisma.studentProfile.findUnique({
        where: { id },
      });

      if (!existingEstudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      console.log('✓ Estudiante encontrado, puede borrarse');

      await this.prisma.studentProfile.delete({
        where: { id },
      });

      return { message: 'Estudiante eliminado correctamente' };
    } catch (e) {
      console.error('Error al eliminar el estudiante:', e);
      throw e;
    }
  }

  // PARTE 2: Consulta 1 - Filtrado con operadores AND
  async findByFilters(
    filters: FilterEstudianteDto,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Construir condiciones con operador AND
      const whereConditions: Prisma.StudentProfileWhereInput = {};

      if (filters.careerId) {
        whereConditions.careerId = filters.careerId;
      }

      if (filters.currentCicle) {
        whereConditions.currentCicle = filters.currentCicle;
      }

      // Rango de ciclos usando AND con gte y lte
      if (filters.minCicle || filters.maxCicle) {
        whereConditions.currentCicle = {
          ...(filters.minCicle && { gte: filters.minCicle }),
          ...(filters.maxCicle && { lte: filters.maxCicle }),
        };
      }

      const [estudiantes, total] = await Promise.all([
        this.prisma.studentProfile.findMany({
          where: whereConditions,
          skip,
          take: limit,
          include: {
            career: true,
          },
        }),
        this.prisma.studentProfile.count({
          where: whereConditions,
        }),
      ]);

      console.log('✓ Estudiantes filtrados encontrados');
      return {
        data: estudiantes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          filters: whereConditions,
        },
      };
    } catch (e) {
      console.error('Error al filtrar estudiantes:', e);
      throw e;
    }
  }

  // PARTE 3: Consulta Nativa - Reporte de rendimiento estudiantil
  async getStudentPerformanceReport(reportParams: ReportDto) {
    try {
      // Construir query nativa con filtros dinámicos
      const conditions: string[] = ['1=1']; // Condición base
      const params: any[] = [];

      if (reportParams.careerId) {
        params.push(reportParams.careerId);
        conditions.push(`cr.id = $${params.length}`);
      }

      if (reportParams.minGrade !== undefined) {
        params.push(reportParams.minGrade);
        conditions.push(`ss.grade >= $${params.length}`);
      }

      if (reportParams.status) {
        params.push(reportParams.status);
        conditions.push(`ss.status = $${params.length}`);
      }

      const whereClause = conditions.join(' AND ');

      // Query nativa usando $queryRaw
      const report = await this.prisma.$queryRaw<
        Array<{
          student_id: number;
          student_user_id: number;
          career_name: string;
          current_cicle: number;
          total_subjects: bigint;
          average_grade: number;
          approved_subjects: bigint;
          failed_subjects: bigint;
        }>
      >(
        Prisma.sql`
          SELECT 
            sp.id as student_id,
            sp.user_id as student_user_id,
            cr.name as career_name,
            sp.current_cicle,
            COUNT(ss.id) as total_subjects,
            ROUND(AVG(ss.grade::numeric), 2) as average_grade,
            COUNT(CASE WHEN ss.status = 'approved' THEN 1 END) as approved_subjects,
            COUNT(CASE WHEN ss.status = 'failed' THEN 1 END) as failed_subjects
          FROM student_profile sp
          INNER JOIN career_reference cr ON sp.career_id = cr.id
          LEFT JOIN student_subject ss ON sp.id = ss.student_profile_id
          WHERE ${Prisma.raw(whereClause)}
          GROUP BY sp.id, sp.user_id, cr.name, sp.current_cicle
          ORDER BY average_grade DESC NULLS LAST
        `,
      );

      // Convertir BigInt a Number para JSON serialization
      const formattedReport = report.map((row) => ({
        studentId: row.student_id,
        studentUserId: row.student_user_id,
        careerName: row.career_name,
        currentCicle: row.current_cicle,
        totalSubjects: Number(row.total_subjects),
        averageGrade: row.average_grade || 0,
        approvedSubjects: Number(row.approved_subjects),
        failedSubjects: Number(row.failed_subjects),
      }));

      console.log('✓ Reporte de rendimiento generado');
      return {
        data: formattedReport,
        meta: {
          totalStudents: formattedReport.length,
          filters: reportParams,
        },
      };
    } catch (e) {
      console.error('Error al generar reporte:', e);
      throw e;
    }
  }

  // PARTE 4: Transacción - Matriculación con control de cupos
  async enrollStudent(enrollData: EnrollStudentDto) {
    try {
      // Usar transacción para garantizar atomicidad
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Verificar que existe el estudiante
        const student = await prisma.studentProfile.findUnique({
          where: { id: enrollData.studentProfileId },
          include: { career: true },
        });

        if (!student) {
          throw new NotFoundException('Estudiante no encontrado');
        }

        // 2. Verificar que existe la materia
        const subject = await prisma.subjectReference.findUnique({
          where: { id: enrollData.subjectId },
        });

        if (!subject) {
          throw new NotFoundException('Materia no encontrada');
        }

        // 3. Verificar que hay cupos disponibles
        if (subject.availableSpots <= 0) {
          throw new BadRequestException(
            `No hay cupos disponibles para la materia ${subject.name}. Cupos totales: ${subject.totalSpots}`,
          );
        }

        // 4. Verificar que el estudiante no esté ya matriculado
        const existingEnrollment = await prisma.studentSubject.findUnique({
          where: {
            studentProfileId_subjectId: {
              studentProfileId: enrollData.studentProfileId,
              subjectId: enrollData.subjectId,
            },
          },
        });

        if (existingEnrollment) {
          throw new ConflictException(
            'El estudiante ya está matriculado en esta materia',
          );
        }

        // 5. Crear la matriculación
        const enrollment = await prisma.studentSubject.create({
          data: {
            studentProfileId: enrollData.studentProfileId,
            subjectId: enrollData.subjectId,
            status: 'enrolled',
          },
          include: {
            subject: true,
            studentProfile: {
              include: {
                career: true,
              },
            },
          },
        });

        // 6. Decrementar los cupos disponibles (operación atómica)
        const updatedSubject = await prisma.subjectReference.update({
          where: { id: enrollData.subjectId },
          data: {
            availableSpots: {
              decrement: 1,
            },
          },
        });

        console.log(
          `✓ Estudiante matriculado. Cupos restantes: ${updatedSubject.availableSpots}/${updatedSubject.totalSpots}`,
        );

        return {
          enrollment,
          subject: updatedSubject,
        };
      });

      return {
        message: 'Matriculación exitosa',
        data: result.enrollment,
        subjectInfo: {
          id: result.subject.id,
          name: result.subject.name,
          availableSpots: result.subject.availableSpots,
          totalSpots: result.subject.totalSpots,
        },
      };
    } catch (e) {
      console.error('Error en la matriculación:', e);
      throw e;
    }
  }

  // PARTE 1 - CONSULTA 1: Estudiantes activos con carrera
  async getActiveStudentsWithCareer(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [estudiantes, total] = await Promise.all([
        this.prisma.studentProfile.findMany({
          where: {
            user: {
              status: 'active', // Filtrar por estudiantes activos
            },
          },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
            career: {
              select: {
                id: true,
                name: true,
                totalCicles: true,
              },
            },
          },
          orderBy: {
            user: {
              name: 'asc',
            },
          },
        }),
        this.prisma.studentProfile.count({
          where: {
            user: {
              status: 'active',
            },
          },
        }),
      ]);

      console.log('✓ Estudiantes activos con carrera encontrados');
      return {
        data: estudiantes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (e) {
      console.error('Error al obtener estudiantes activos:', e);
      throw e;
    }
  }

  // PARTE 1 - CONSULTA 4: Matrículas de estudiante por período académico
  async getStudentEnrollmentsByCycle(studentId: number, cycleId?: number) {
    try {
      // Verificar que existe el estudiante
      const student = await this.prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          user: true,
          career: true,
        },
      });

      if (!student) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      // Construir condiciones de búsqueda
      const whereConditions: any = {
        studentProfileId: studentId,
      };

      // Si se especifica un ciclo, filtrar por él
      if (cycleId) {
        whereConditions.cycleId = cycleId;
      }

      // Obtener matrículas
      const enrollments = await this.prisma.studentSubject.findMany({
        where: whereConditions,
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              careerId: true,
              cicleNumber: true,
            },
          },
          cycle: {
            select: {
              id: true,
              name: true,
              year: true,
              period: true,
            },
          },
        },
        orderBy: [
          {
            cycle: {
              year: 'desc',
            },
          },
          {
            cycle: {
              period: 'desc',
            },
          },
          {
            subject: {
              name: 'asc',
            },
          },
        ],
      });

      console.log('✓ Matrículas del estudiante obtenidas');
      return {
        student: {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          career: student.career.name,
          currentCicle: student.currentCicle,
        },
        enrollments: enrollments.map((enrollment) => ({
          id: enrollment.id,
          subject: enrollment.subject,
          cycle: enrollment.cycle,
          grade: enrollment.grade ? Number(enrollment.grade) : null,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
        })),
        meta: {
          totalEnrollments: enrollments.length,
          cycleFilter: cycleId || 'todos',
        },
      };
    } catch (e) {
      console.error('Error al obtener matrículas del estudiante:', e);
      throw e;
    }
  }
}
import { Injectable, InternalServerErrorException,ConflictException,NotFoundException } from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { PrismaAcademicService } from 'src/prisma/PrismaAcademicService';


@Injectable()
export class EspecialidadService {
  constructor(private readonly prisma: PrismaAcademicService) {}

  async create(createEspecialidadDto: CreateEspecialidadDto) {
    try {
      const especialidad = await this.prisma.speciality.create({
        data: {

          name: createEspecialidadDto.nombre,
        },
      });

      console.log('✓ Especialidad creada correctamente');
      return especialidad;

    } catch {
      throw new ConflictException('Error al crear la especialidad');

    }
  }

  //
   async findAll(page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;

    const [especialidades, total] = await Promise.all([
      this.prisma.speciality.findMany({
        skip,       
        take: limit, 
        select: { 
          id: true,
          name: true 
        },
      }),
      this.prisma.speciality.count(), 
    ]);

    console.log('✓ Especialidades encontradas');
    return {
      data: especialidades,
      meta:{
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      },
    };

  } catch {
    throw new InternalServerErrorException('Error al obtener especialidades');
  }
}


//
  async findOne(id: number) {
    try {
      const especialidad = await this.prisma.speciality.findUnique({
        where: { id },
      });

      if (!especialidad) {
        console.log('Especialidad no encontrada');
        throw new NotFoundException('Especialidad no encontrada');
      }

      console.log('✓ Especialidad encontrada');
      return especialidad;
    } catch (e) {
      console.error('Error al buscar especialidad:', e);
      throw e;
    }
  }

  //
  async update(id: number, updateEspecialidadDto: UpdateEspecialidadDto) {
    try {
      const existingSpeciality = await this.prisma.speciality.findUnique({
        where: { id },
      });

      if (!existingSpeciality) {
        throw new NotFoundException('Especialidad no encontrada');
      }

      const especialidadActualizada = await this.prisma.speciality.update({
        where: { id },
        data: updateEspecialidadDto,
      });

      return especialidadActualizada;
    } catch (e) {
      console.error('Error al actualizar la especialidad:', e);
      throw e;
    }
  }

//
  async remove(id: number) {
   try {
      const existingSpeciality = await this.prisma.speciality.findUnique({
        where: { id },
      });

      if (!existingSpeciality) {
        throw new NotFoundException('Especialidad no encontrada');
      }

      console.log('✓ Especialidad encontrada, puede borrarse');

      await this.prisma.speciality.delete({
        where: { id },
      });

      return { message: 'Especialidad eliminada correctamente' };
    } catch (e) {
      console.error('Error al eliminar la especialidad:', e);
      throw e;
    }
  }
}

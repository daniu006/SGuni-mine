import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { FilterEstudianteDto } from './dto/filter-estudiante.dto';
import { ReportDto } from './dto/report.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto'; // ⬅️ IMPORT AGREGADO

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) { }

  @Post(':id_carrera')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('id_carrera', ParseIntPipe) id_carrera: number,
    @Body() createEstudianteDto: CreateEstudianteDto
  ) {
    return this.estudianteService.create(createEstudianteDto, id_carrera);
  }

  @Get()
  findAll(
    @Query('page') page?: 1,
    @Query('limit') limit?: 10,
  ) {
    return this.estudianteService.findAll(page ? +page : 1, limit ? +limit : 10);
  }

  // ==========================================
  // PARTE 1 - CONSULTA 1: Estudiantes activos con carrera
  // IMPORTANTE: Este endpoint debe ir ANTES de @Get(':id')
  // ==========================================
  @Get('activos')
  getActiveStudents(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.estudianteService.getActiveStudentsWithCareer(
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  // ==========================================
  // PARTE 2: Consulta 1 - Endpoint de filtrado con AND
  // IMPORTANTE: Este endpoint debe ir ANTES de @Get(':id')
  // ==========================================
  @Get('filter/search')
  findByFilters(
    @Query() filters: FilterEstudianteDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.estudianteService.findByFilters(
      filters,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  // ==========================================
  // PARTE 3: Consulta Nativa - Endpoint de reporte
  // IMPORTANTE: Este endpoint debe ir ANTES de @Get(':id')
  // ==========================================
  @Get('report/performance')
  getPerformanceReport(@Query() reportParams: ReportDto) {
    return this.estudianteService.getStudentPerformanceReport(reportParams);
  }

  // Este endpoint debe ir DESPUÉS de los específicos
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estudianteService.findOne(id);
  }

  // ==========================================
  // PARTE 1 - CONSULTA 4: Matrículas por período académico
  // Este puede ir aquí porque tiene :id en la ruta
  // ==========================================
  @Get(':id/matriculas')
  getStudentEnrollments(
    @Param('id', ParseIntPipe) id: number,
    @Query('cycleId') cycleId?: string,
  ) {
    const cycleIdNumber = cycleId ? parseInt(cycleId, 10) : undefined;
    return this.estudianteService.getStudentEnrollmentsByCycle(id, cycleIdNumber);
  }

  @Patch(':id/:id_carrera')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('id_carrera', ParseIntPipe) id_carrera: number,
    @Body() updateEstudianteDto: UpdateEstudianteDto
  ) {
    return this.estudianteService.update(id, updateEstudianteDto, id_carrera);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.estudianteService.remove(+id);
  }

  // ==========================================
  // PARTE 4: Transacción - Endpoint de matriculación
  // ==========================================
  @Post('enroll')
  @HttpCode(HttpStatus.CREATED)
  enrollStudent(@Body() enrollData: EnrollStudentDto) {
    return this.estudianteService.enrollStudent(enrollData);
  }
}
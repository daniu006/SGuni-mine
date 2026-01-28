import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { FilterDocenteDto } from './dto/filter-docente.dto';

@Controller('docente')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) { }

  @Post(':id_especialidad')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('id_especialidad', ParseIntPipe) id_especialidad: number,
    @Body() createDocenteDto: CreateDocenteDto
  ) {
    return this.docenteService.create(createDocenteDto, id_especialidad);
  }

  @Get()
  findAll(
    @Query('page') page?: 1,
    @Query('limit') limit?: 10,
  ) {
    return this.docenteService.findAll(page ? +page : 1, limit ? +limit : 10);
  }

  // ==========================================
  // PARTE 1 - CONSULTA 3: Docentes con múltiples asignaturas
  // IMPORTANTE: Este endpoint debe ir ANTES de @Get(':id')
  // ==========================================
  @Get('multiples-asignaturas')
  getTeachersWithMultipleSubjects(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.docenteService.getTeachersWithMultipleSubjects(
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  // ==========================================
  // PARTE 2: Consulta 2 - Endpoint de filtrado con AND, OR, NOT
  // IMPORTANTE: Este endpoint también debe ir ANTES de @Get(':id')
  // ==========================================
  @Get('filter/search')
  findByComplexFilters(
    @Query() filters: FilterDocenteDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.docenteService.findByComplexFilters(
      filters,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  // Este endpoint debe ir AL FINAL de los GET
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.findOne(id);
  }

  @Patch(':id/:id_especialidad')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('id_especialidad', ParseIntPipe) id_especialidad: number,
    @Body() updateDocenteDto: UpdateDocenteDto
  ) {
    return this.docenteService.update(id, updateDocenteDto, id_especialidad);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.docenteService.remove(+id);
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';

@Controller('carrera')
export class CarreraController {
  constructor(private readonly carreraService: CarreraService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carreraService.create(createCarreraDto);
  }

  @Get()
  findAll(
    @Query('page') page?: 1,
    @Query('limit') limit?: 10,
  ) {
    return this.carreraService.findAll(page ? +page : 1, limit ? +limit : 10);
  }

  // ==========================================
  // PARTE 1 - CONSULTA 2: Materias por carrera
  // IMPORTANTE: Este endpoint debe ir ANTES de @Get(':id')
  // ==========================================
  @Get(':id/materias')
  getSubjectsByCareer(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.carreraService.getSubjectsByCareer(
      id,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.carreraService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateCarreraDto: UpdateCarreraDto) {
    return this.carreraService.update(+id, updateCarreraDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.carreraService.remove(+id);
  }
}

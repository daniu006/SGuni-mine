import { Controller, Get, Post, Body, Patch, Param, Delete,HttpCode,HttpStatus,ParseIntPipe, Query} from '@nestjs/common';
import { MateriasService } from './materias.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';

@Controller('materias')
export class MateriasController {
  constructor(private readonly materiasService: MateriasService) {}

  @Post(':id_docente/:id_carrera/:id_ciclo')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('id_docente', ParseIntPipe) id_docente: number,
    @Param('id_carrera', ParseIntPipe) id_carrera: number,
    @Param('id_ciclo', ParseIntPipe) id_ciclo: number,
    @Body() createMateriaDto: CreateMateriaDto
  ) {
    return this.materiasService.create(createMateriaDto, id_docente, id_carrera, id_ciclo);
  }

  @Get()
  findAll(
    @Query ('page') page?:1,
    @Query ('limit') limit?:10,
  ) {
    return this.materiasService.findAll(page? +page:1, limit? +limit:10);
  }

  @Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.materiasService.findOne(id);
}

  @Patch(':id/:id_docente/:id_carrera/:id_ciclo')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('id_docente', ParseIntPipe) id_docente: number,
    @Param('id_carrera', ParseIntPipe) id_carrera: number,
    @Param('id_ciclo', ParseIntPipe) id_ciclo: number,
    @Body() updateMateriaDto: UpdateMateriaDto
  ) {
    return this.materiasService.update(id, updateMateriaDto, id_docente, id_carrera, id_ciclo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.materiasService.remove(+id);
  }
}
